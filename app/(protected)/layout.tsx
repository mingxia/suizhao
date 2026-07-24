import Link from "next/link";
import { requireSession } from "@/lib/session";
export default async function ProtectedLayout({children}:{children:React.ReactNode}){await requireSession();return <><header className="container" style={{display:"flex",justifyContent:"space-between"}}><Link href="/dashboard">岁照</Link><nav><Link href="/dashboard">我的</Link> <Link className="btn" href="/persons/new">创建人物</Link></nav></header>{children}</>}
