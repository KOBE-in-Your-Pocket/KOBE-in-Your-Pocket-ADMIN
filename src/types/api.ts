/**
 * REST API の統一エラーレスポンス（Backend `ApiErrorResponse`）。
 */
export type ApiErrorResponse = {
  status: number;
  error: string;
  message: string;
  violations: FieldViolation[];
};

/** バリデーションエラーの項目別内訳。 */
export type FieldViolation = {
  field: string;
  message: string;
};

/** メタ情報付きリスト応答の封筒（避難所一覧など）。 */
export type ListResponse<T, M> = {
  data: T[];
  meta: M;
};
