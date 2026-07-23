/**
 * ユーザー管理画面の mock データ。
 *
 * 一覧 API（GET /users）は未整備で Backend #151 で起票済み。
 * 実 API 接続は #34、削除 API 接続（2段階確認）は #35。
 * mock データ層の整備は #26。
 */
export type MockUser = {
  id: string;
  name: string;
  /** アバターに表示する頭文字。 */
  initial: string;
  /** アバターの背景色。 */
  color: string;
  date: string;
};

export const MOCK_USERS: MockUser[] = [
  { id: "user_1001", name: "Alice Johnson", initial: "A", color: "#2E7D32", date: "2024/04/20" },
  { id: "user_1002", name: "Michael Chen", initial: "M", color: "#1E5AA7", date: "2024/04/21" },
  { id: "user_1003", name: "Yuki Tanaka", initial: "Y", color: "#F39C12", date: "2024/04/22" },
  { id: "user_1004", name: "김민지", initial: "김", color: "#7C3AED", date: "2024/04/23" },
  { id: "user_1005", name: "王小明", initial: "王", color: "#E53935", date: "2024/04/24" },
  { id: "user_1006", name: "Emma Wilson", initial: "E", color: "#0E7C86", date: "2024/04/25" },
  { id: "user_1007", name: "佐藤 健", initial: "佐", color: "#B45309", date: "2024/04/26" },
  { id: "user_1008", name: "David Kim", initial: "D", color: "#2E7D32", date: "2024/04/27" },
  { id: "user_1009", name: "李美花", initial: "李", color: "#1E5AA7", date: "2024/04/28" },
  { id: "user_1010", name: "Sophia Martinez", initial: "S", color: "#F39C12", date: "2024/04/29" },
  { id: "user_1011", name: "鈴木 一郎", initial: "鈴", color: "#7C3AED", date: "2024/04/30" },
  { id: "user_1012", name: "Olivia Brown", initial: "O", color: "#E53935", date: "2024/05/01" },
];
