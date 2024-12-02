import { registerAs } from '@nestjs/config';

export const AxiosConfig = registerAs('axios', () => ({
  timeout: +process.env.AXIOS_TIMEOUT,
  timeoutErrorMessage: '请求超时，请稍后重试！',
}));
