'use client'

import AuthFlowModal from "@/components/modal/AuthFlowModal";
import SignupForm from "@/components/form/SignupForm";

export default async function SignupPage() {
	return (
		<AuthFlowModal title='Sign up' description="Start using Zisk">
			<SignupForm />
		</AuthFlowModal>
	);
}
