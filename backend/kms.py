"""
Pluggable KMS with AES-256-GCM envelope encryption.

Pattern:
- A "master" Key-Encrypting Key (KEK) lives in a KMS (or env for LocalKmsProvider).
- Every encrypted blob gets its own random per-blob Data-Encryption Key (DEK).
- The DEK encrypts the payload; the KEK encrypts the DEK.
- We store {v, nonce, enc_dek, ciphertext} — the KEK never leaves the KMS.

Swap LocalKmsProvider with AwsKmsProvider / GcpKmsProvider in one line (future).
"""
from __future__ import annotations

import base64
import json
import os
from abc import ABC, abstractmethod

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from config import settings


# ── Provider interface ──────────────────────────────────────────────────────
class KmsProvider(ABC):
    """Pluggable KMS — encrypts/decrypts the DEK only."""

    @abstractmethod
    def key_id(self) -> str:
        """Identifier for the KEK (version-aware)."""

    @abstractmethod
    def wrap(self, plaintext: bytes) -> bytes:
        """Wrap (encrypt) the DEK with the KEK."""

    @abstractmethod
    def unwrap(self, ciphertext: bytes, key_id: str) -> bytes:
        """Unwrap (decrypt) the DEK using the identified KEK."""


# ── Local provider (dev / small prod) ───────────────────────────────────────
class LocalKmsProvider(KmsProvider):
    """
    Reads a base64 32-byte KEK from settings.TOKEN_ENCRYPTION_KEY.
    To rotate: append `KEK_v2=<base64>` etc. to env and update `_active_key_id`.
    """

    def __init__(self):
        self._keys: dict[str, bytes] = {}
        primary = base64.b64decode(settings.TOKEN_ENCRYPTION_KEY)
        if len(primary) != 32:
            raise RuntimeError("TOKEN_ENCRYPTION_KEY must be 32 bytes (base64 encoded)")
        self._keys["local/v1"] = primary
        self._active_key_id = "local/v1"

        # Optional future rotation: env vars like KEK_local_v2, KEK_local_v3
        for env_k, env_v in os.environ.items():
            if env_k.startswith("KEK_local_v"):
                version = env_k.replace("KEK_", "")
                try:
                    raw = base64.b64decode(env_v)
                    if len(raw) == 32:
                        self._keys[version.replace("_", "/")] = raw
                        self._active_key_id = version.replace("_", "/")
                except Exception:
                    continue

    def key_id(self) -> str:
        return self._active_key_id

    def wrap(self, plaintext: bytes) -> bytes:
        kek = self._keys[self._active_key_id]
        nonce = os.urandom(12)
        ct = AESGCM(kek).encrypt(nonce, plaintext, self._active_key_id.encode())
        return nonce + ct

    def unwrap(self, ciphertext: bytes, key_id: str) -> bytes:
        if key_id not in self._keys:
            raise ValueError(f"Unknown KEK {key_id}")
        kek = self._keys[key_id]
        nonce, ct = ciphertext[:12], ciphertext[12:]
        return AESGCM(kek).decrypt(nonce, ct, key_id.encode())


# Singleton
_provider: KmsProvider = LocalKmsProvider()


def get_kms() -> KmsProvider:
    return _provider


# ── Envelope encryption API ─────────────────────────────────────────────────
ENVELOPE_VERSION = 1


def envelope_encrypt(plaintext: str) -> str:
    """
    Generate a new DEK, encrypt the payload with it, then wrap the DEK with
    the KMS KEK. Returns a JSON-packed base64 blob safe for DB storage.
    """
    kms = get_kms()
    dek = os.urandom(32)
    payload_nonce = os.urandom(12)
    ct = AESGCM(dek).encrypt(payload_nonce, plaintext.encode(), None)
    wrapped_dek = kms.wrap(dek)

    envelope = {
        "v": ENVELOPE_VERSION,
        "k": kms.key_id(),                                    # KEK id used
        "d": base64.b64encode(wrapped_dek).decode(),          # wrapped DEK
        "n": base64.b64encode(payload_nonce).decode(),        # payload nonce
        "c": base64.b64encode(ct).decode(),                   # ciphertext
    }
    return base64.b64encode(json.dumps(envelope, separators=(",", ":")).encode()).decode()


def envelope_decrypt(blob: str) -> str:
    """
    Reverse of envelope_encrypt. Transparently falls back to the LEGACY v0
    format (raw AES-GCM with the master KEK directly) for blobs created
    before KMS was introduced.
    """
    raw = base64.b64decode(blob)
    # Heuristic: v≥1 is JSON starting with '{', v0 is just 12-byte nonce + ct
    if raw and raw[:1] == b"{":
        env = json.loads(raw.decode())
        kms = get_kms()
        wrapped_dek = base64.b64decode(env["d"])
        dek = kms.unwrap(wrapped_dek, env["k"])
        nonce = base64.b64decode(env["n"])
        ct = base64.b64decode(env["c"])
        return AESGCM(dek).decrypt(nonce, ct, None).decode()

    # Legacy v0 format — direct AES-GCM with the master key (pre-KMS)
    legacy_kek = base64.b64decode(settings.TOKEN_ENCRYPTION_KEY)
    return AESGCM(legacy_kek).decrypt(raw[:12], raw[12:], None).decode()


# Convenience aliases matching the old API — drop-in replacement.
encrypt_envelope = envelope_encrypt
decrypt_envelope = envelope_decrypt
