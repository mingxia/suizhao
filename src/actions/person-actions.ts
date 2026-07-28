"use server";
import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { persons, yearPhotos } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { getLatestAvailableAge } from "@/lib/age";
import { personSchema } from "@/lib/validation";
import { requirePersonOwner } from "@/lib/permissions";
import type { ActionResult } from "@/types/action-result";
export async function createPerson(_: unknown, formData: FormData): Promise<ActionResult<{id:string}>> { const session = await requireSession(); const parsed = personSchema.safeParse(Object.fromEntries(formData)); if(!parsed.success) return {success:false,error:{code:"INVALID_INPUT",message:"请检查人物资料"}}; const now=new Date(); const id=crypto.randomUUID(); await (await getDb()).insert(persons).values({id,ownerId:session.user.id,name:parsed.data.name,nickname:parsed.data.nickname||null,birthday:parsed.data.birthday,privacy:parsed.data.privacy,createdAt:now,updatedAt:now}); revalidatePath("/dashboard"); return {success:true,data:{id}}; }
export async function updatePerson(personId:string, formData:FormData):Promise<ActionResult>{ const session=await requireSession(); await requirePersonOwner(personId,session.user.id); const parsed=personSchema.safeParse(Object.fromEntries(formData)); if(!parsed.success) return {success:false,error:{code:"INVALID_INPUT",message:"请检查人物资料"}}; const [highest]=await (await getDb()).select({age:max(yearPhotos.age)}).from(yearPhotos).where(eq(yearPhotos.personId,personId)); if((highest?.age??0)>getLatestAvailableAge(parsed.data.birthday)) return {success:false,error:{code:"INVALID_INPUT",message:"修改后的出生日期与现有年龄照片不一致，请先处理相关照片。"}}; await (await getDb()).update(persons).set({...parsed.data,nickname:parsed.data.nickname||null,updatedAt:new Date()}).where(eq(persons.id,personId)); revalidatePath(`/persons/${personId}`); return {success:true,data:undefined}; }

// React form actions must resolve to void. Keep the result-returning actions above
// available for stateful clients, and use these adapters for plain <form> elements.
export async function createPersonFromForm(formData: FormData): Promise<void> {
  await createPerson(undefined, formData);
}

export async function updatePersonFromForm(personId: string, formData: FormData): Promise<void> {
  await updatePerson(personId, formData);
}
