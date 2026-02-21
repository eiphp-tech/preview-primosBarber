import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// ⚠️ AJUSTE 1: Mudei o padrão para "7d" (7 dias)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Verificar se JWT_SECRET está configurado
if (!process.env.JWT_SECRET) {
  console.warn("AVISO: JWT_SECRET não configurado no .env");
}

// Gerar token JWT
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verificar e decodificar token JWT
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    // Erro 1: Token venceu o prazo
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expirado");
    }

    // ⚠️ AJUSTE 2: Corrigi para JsonWebTokenError (Token malformado/falso)
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Token inválido");
    }

    throw new Error("Erro ao verificar token");
  }
};
