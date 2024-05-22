"use server"

import { db } from "@/db"
import { CaseColor, CaseMaterial, PhoneModel, caseFinish } from "@prisma/client"
export type saveConfigArgs = {
    color: CaseColor,
    finish: caseFinish,
    material: CaseMaterial,
    model: PhoneModel,
    configId: string,
}
export async function saveConfig({
    model,
    material,
    finish,
    configId,
    color
}: saveConfigArgs) {
    await db.configuration.update({
        where: { id: configId },
        data: {
            model,
            material,
            finish,
            color
        }
    })

}