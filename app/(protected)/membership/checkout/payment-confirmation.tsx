"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { submitLifetimeOrder } from "@/actions/order-actions";

export function PaymentConfirmation() {
  const [confirmed, setConfirmed] = useState(false);
  const [, formAction, pending] = useActionState(async () => {
    await submitLifetimeOrder();
    return null;
  }, null);

  if (!confirmed) {
    return <button className="btn checkout-primary" type="button" onClick={() => setConfirmed(true)}>确认用户信息并继续付款</button>;
  }

  return <div className="payment-panel card">
    <div className="wechat-qr">
      <Image src="/images/weixin.jpeg" alt="微信付款二维码" width={260} height={260} priority />
    </div>
    <p>请使用微信扫码付款。付款完成后点击下方按钮，我们会为管理员生成一条待处理订单。</p>
    <form action={formAction}>
      <button className="btn checkout-primary" disabled={pending}>{pending ? "正在提交订单…" : "我已经付款，提交待核实订单"}</button>
    </form>
  </div>;
}
