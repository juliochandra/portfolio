import type { IconType } from "react-icons";

type ProcessStepProps = {
	description: string;
	icon: IconType;
	number: number;
	showConnector: boolean;
	title: string;
};

export function ProcessStep({ description, icon: Icon, number, showConnector, title }: ProcessStepProps) {
	return (
		<li className="relative text-center lg:text-left">
			{showConnector ? (
				<span
					className="absolute top-8 left-[calc(50%+2rem)] hidden w-[calc(100%-4rem)] border-border border-t border-dashed lg:block"
					aria-hidden="true"
				/>
			) : null}
			<div className="relative z-10 mx-auto grid size-16 place-items-center rounded-full border border-border bg-canvas text-accent lg:mx-0">
				<Icon className="text-2xl" aria-hidden="true" />
			</div>
			<p className="mt-5 font-mono text-sm text-text-mute">0{number}</p>
			<h3 className="mt-2 font-bold text-xl">{title}</h3>
			<p className="mt-2 text-text-mute leading-7">{description}</p>
		</li>
	);
}
