import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function n(
  id: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: CanvasNode["data"]["shape"],
  fill: string,
  text: string,
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, shape, color: fill, textColor: text },
    style: { width: w, height: h },
  };
}

function e(id: string, source: string, target: string, label?: string): CanvasEdge {
  return { id, source, target, type: "canvasEdge", data: label ? { label } : {} };
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices Architecture",
  description: "API gateway routing to auth, user, and order services backed by a shared data layer.",
  nodes: [
    n("ms-gw", "API Gateway", 160, 0, 160, 44, "pill", "#10233D", "#52A8FF"),
    n("ms-auth", "Auth Service", 0, 120, 140, 44, "rectangle", "#2E1938", "#BF7AF0"),
    n("ms-user", "User Service", 180, 120, 140, 44, "rectangle", "#0F2E18", "#62C073"),
    n("ms-order", "Order Service", 360, 120, 140, 44, "rectangle", "#331B00", "#FF990A"),
    n("ms-pay", "Payment Service", 60, 240, 140, 44, "rectangle", "#3C1618", "#FF6166"),
    n("ms-prod", "Product Service", 270, 240, 140, 44, "rectangle", "#062822", "#0AC7B4"),
    n("ms-db", "Database", 450, 218, 110, 72, "cylinder", "#10233D", "#52A8FF"),
  ],
  edges: [
    e("mse-1", "ms-gw", "ms-auth"),
    e("mse-2", "ms-gw", "ms-user"),
    e("mse-3", "ms-gw", "ms-order"),
    e("mse-4", "ms-auth", "ms-pay"),
    e("mse-5", "ms-order", "ms-pay"),
    e("mse-6", "ms-user", "ms-prod"),
    e("mse-7", "ms-pay", "ms-db"),
    e("mse-8", "ms-prod", "ms-db"),
  ],
};

const cicd: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description: "Source to production: build, test, security scan, staging deploy, and release.",
  nodes: [
    n("ci-src", "Source Control", 0, 58, 140, 44, "rectangle", "#10233D", "#52A8FF"),
    n("ci-bld", "Build", 180, 58, 140, 44, "rectangle", "#0F2E18", "#62C073"),
    n("ci-tst", "Test Suite", 360, 58, 140, 44, "rectangle", "#062822", "#0AC7B4"),
    n("ci-scn", "Security Scan", 540, 28, 130, 80, "diamond", "#331B00", "#FF990A"),
    n("ci-stg", "Staging Deploy", 720, 58, 140, 44, "rectangle", "#2E1938", "#BF7AF0"),
    n("ci-prd", "Production", 900, 58, 140, 44, "rectangle", "#0F2E18", "#62C073"),
  ],
  edges: [
    e("cie-1", "ci-src", "ci-bld", "push"),
    e("cie-2", "ci-bld", "ci-tst"),
    e("cie-3", "ci-tst", "ci-scn"),
    e("cie-4", "ci-scn", "ci-stg", "pass"),
    e("cie-5", "ci-stg", "ci-prd", "approve"),
  ],
};

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "Producer publishes to an event bus consumed by multiple services, with dead-letter handling.",
  nodes: [
    n("ev-src", "Event Producer", 0, 100, 150, 44, "pill", "#331B00", "#FF990A"),
    n("ev-bus", "Event Bus", 220, 78, 150, 80, "hexagon", "#10233D", "#52A8FF"),
    n("ev-ca", "Consumer A", 460, 0, 140, 44, "rectangle", "#0F2E18", "#62C073"),
    n("ev-cb", "Consumer B", 460, 78, 140, 44, "rectangle", "#062822", "#0AC7B4"),
    n("ev-cc", "Consumer C", 460, 156, 140, 44, "rectangle", "#2E1938", "#BF7AF0"),
    n("ev-dlq", "Dead Letter Queue", 220, 228, 150, 64, "cylinder", "#3C1618", "#FF6166"),
  ],
  edges: [
    e("eve-1", "ev-src", "ev-bus", "publish"),
    e("eve-2", "ev-bus", "ev-ca"),
    e("eve-3", "ev-bus", "ev-cb"),
    e("eve-4", "ev-bus", "ev-cc"),
    e("eve-5", "ev-bus", "ev-dlq", "failed"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven];
