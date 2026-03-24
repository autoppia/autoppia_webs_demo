import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { webcrypto } from "crypto";

if (!global.TextEncoder) {
  // jsdom on this runtime does not provide these by default.
  global.TextEncoder = TextEncoder as typeof global.TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

if (!global.crypto || !global.crypto.subtle) {
  global.crypto = webcrypto as Crypto;
}
