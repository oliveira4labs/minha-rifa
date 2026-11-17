/** Erro lançado pelo express.json (ex.: `entity.too.large`, `entity.parse.failed`). */
export interface BodyParserError {
  type?: string;
}
