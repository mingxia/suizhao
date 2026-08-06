"use client";

import { useEffect, useState, useTransition } from "react";
import { reviewLifetimeOrder } from "@/actions/order-actions";

export type PendingOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: "CNY" | "USD";
  createdAt: string;
};

export function AdminOrderPanel({ orders }: { orders: PendingOrder[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && !pending && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, pending]);

  function review(order: PendingOrder, decision: "approve" | "delete") {
    if (decision === "delete" && !window.confirm(`确定删除 ${order.customerName} 的待处理订单吗？此操作无法撤销。`)) return;
    setError("");
    setActiveId(order.id);
    startTransition(async () => {
      const result = await reviewLifetimeOrder(order.id, decision);
      if (!result.success) setError(result.error);
      setActiveId(undefined);
    });
  }

  return <>
    <button className="card admin-metric-card admin-order-trigger" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
      <div className="admin-metric-icon" aria-hidden="true">单</div>
      <p>待处理订单</p>
      <strong>{orders.length.toLocaleString("zh-CN")}</strong>
      <span className="admin-card-action">查看并处理 <span aria-hidden="true">→</span></span>
    </button>
    {open ? <div className="upload-modal-backdrop admin-order-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !pending) setOpen(false);
    }}>
      <section className="card upload-modal admin-order-modal" role="dialog" aria-modal="true" aria-labelledby="order-dialog-title">
        <button className="modal-close" type="button" aria-label="关闭订单处理弹窗" disabled={pending} onClick={() => setOpen(false)}>×</button>
        <p className="modal-eyebrow">ORDER REVIEW</p>
        <div className="admin-order-heading">
          <div><h2 id="order-dialog-title">待处理订单</h2><p>核对付款信息后，通过订单或将无效订单删除。</p></div>
          <span>{orders.length} 笔待处理</span>
        </div>
        {error ? <p className="form-error admin-order-error" role="alert">{error}</p> : null}
        {orders.length ? <div className="admin-order-list">
          {orders.map((order) => <article className="admin-order-row" key={order.id}>
            <div className="admin-order-avatar" aria-hidden="true">{order.customerName.trim().charAt(0) || "用"}</div>
            <div className="admin-order-customer">
              <strong>{order.customerName}</strong>
              <span>{order.customerEmail}</span>
              <time dateTime={order.createdAt}>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</time>
            </div>
            <div className="admin-order-price"><strong>¥{(order.amountCents / 100).toFixed(2)}</strong><span>终身会员</span></div>
            <div className="admin-order-actions">
              <button className="btn admin-approve-button" type="button" disabled={pending} onClick={() => review(order, "approve")}>{pending && activeId === order.id ? "处理中…" : "通过"}</button>
              <button className="admin-delete-button" type="button" disabled={pending} onClick={() => review(order, "delete")}>删除</button>
            </div>
          </article>)}
        </div> : <div className="admin-order-empty"><span aria-hidden="true">✓</span><strong>订单已全部处理</strong><p>目前没有等待审核的会员订单。</p></div>}
      </section>
    </div> : null}
  </>;
}
