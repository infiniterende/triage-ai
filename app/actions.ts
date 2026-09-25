"use server";

import { SignUpActionState, signUpFormSchema } from "@/lib/schema";
import { redirect } from "next/navigation";

export async function signUpAction(
  _prev: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const form = Object.fromEntries(formData);
  const validationResult = signUpFormSchema.safeParse(form);
  if (!validationResult.success) {
    return {
      form,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  redirect("/");
}
