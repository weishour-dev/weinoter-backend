export enum ClickHouseCompressionMethod {
  NONE = 'NONE',
  GZIP = 'GZIP',
  BROTLI = 'BROTLI',
  DEFLATE = 'DEFLATE',
  XZ = 'xz',
}

export enum ClickHouseConnectionProtocol {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
}

export enum ClickHouseDataFormat {
  JSON = 'JSON',
  JSONCompact = 'JSONCompact',
}
