'use client';

/**
 * Zoom Parallax — 21st.dev
 * Adapted: palette, fallback-aware photos, optional centre caption that the
 * camera "flies through", click-to-open on each frame. Lenis is provided
 * globally by <SmoothScroll/>, so the demo's local Lenis instance is dropped.
 */

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import type { Photo as PhotoT } from '@/content/story';
import { Photo } from '@/components/experience/photo';
import { useLightbox } from '@/components/experience/lightbox';

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: PhotoT[];
	/** Text placed behind the centre frame, revealed as it zooms away. */
	children?: ReactNode;
}

export function ZoomParallax({ images, children }: ZoomParallaxProps) {
	const container = useRef(null);
	const open = useLightbox();
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
	const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
	const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
	const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
	const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);
	const captionOpacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
	const captionScale = useTransform(scrollYProgress, [0.55, 1], [0.85, 1]);
	const frameOpacity = useTransform(scrollYProgress, [0.6, 0.85], [1, 0]);

	const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

	return (
		<div ref={container} className="relative h-[300vh]">
			<div className="sticky top-0 h-screen overflow-hidden bg-beige">
				{children && (
					<motion.div
						style={{ opacity: captionOpacity, scale: captionScale }}
						className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center"
					>
						{children}
					</motion.div>
				)}
				{images.slice(0, 7).map((photo, index) => {
					const scale = scales[index % scales.length];
					return (
						<motion.div
							key={index}
							style={{ scale, opacity: children ? frameOpacity : 1 }}
							className={`pointer-events-none absolute top-0 flex h-full w-full items-center justify-center ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
						>
							<div
								className="pointer-events-auto relative h-[25vh] w-[25vw] overflow-hidden shadow-[0_20px_50px_rgba(48,40,36,0.2)]"
								data-cursor="view"
								onClick={(e) => open(photo, e.currentTarget.getBoundingClientRect())}
							>
								<Photo photo={photo} alt={photo.alt || `Parallax image ${index + 1}`} />
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

export default ZoomParallax;
