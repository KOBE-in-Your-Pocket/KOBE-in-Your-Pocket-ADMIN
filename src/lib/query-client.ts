import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "../api/errors";

/**
 * 401/403/404 等はリトライしても結果が変わらないため即座に諦める。
 * 429 とサーバーエラー・ネットワークエラーのみ 1 回だけ再試行する。
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.isClientError) return false;
  return failureCount < 1;
}

/**
 * 管理画面向け QueryClient のデフォルト設定。
 *
 * 運用データは更新頻度が低い一方で古い値を見せたくないため、staleTime は短めにし、
 * ウィンドウフォーカスでの再取得は無効にしている（一覧画面のちらつき防止）。
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
