import { QueryClient } from "@tanstack/react-query";

/**
 * 管理画面向け QueryClient のデフォルト設定。
 *
 * 運用データは更新頻度が低い一方で古い値を見せたくないため、staleTime は短めにし、
 * ウィンドウフォーカスでの再取得は無効にしている（一覧画面のちらつき防止）。
 *
 * 4xx を判別してリトライを打ち切る制御は共通エラー型の導入後（#11）に入れる。
 * それまでは 401/403 でも 1 回だけ再試行される点に注意。
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
