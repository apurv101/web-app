import { CircularProgress, Stack } from '@mui/material'
import { PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type BottomScrollerProps = PropsWithChildren & {
	/**
	 * By default, the scroller only activates whenever the scroll content height changes.
	 * However, this can have a noticable delay.
	 *
	 * If this prop is present, the scroller will also activate if the values in the list change.
	 */
	heightDeps?: unknown[]
}

/**
 * A scrolling element that keeps its content scrolled to the bottom unless it was manually scrolled up.
 *
 * By default, the scroller only activates whenever the scroll content height changes.
 * When the scroller activates, it scrolls to the bottom of the content if it was previously at the
 * bottom before the last scroll content height change.
 *
 * To avoid delays in scrolling, you can provide the `heightDeps` prop with values that should cause
 * a scroll height change when they change.
 */
export function BottomScroller({ heightDeps = [], children }: BottomScrollerProps) {
	const [scrollerAtBottom, setScrollerAtBottom] = useState(true)
	const scrollerAtBottomRef = useRef(scrollerAtBottom)
	scrollerAtBottomRef.current = scrollerAtBottom

	const scrollingToBottomRef = useRef(false)

	const [loading, setLoading] = useState(true)
	const [loaderHeight, setLoaderHeight] = useState('100%')
	const scrollerRef = useRef<HTMLDivElement>(null)
	const scrollerContentRef = useRef<HTMLDivElement>(null)

	// add a scroll event listener and turn off the loader
	useLayoutEffect(() => {
		const scroller = scrollerRef.current
		if (!scroller) {
			return
		}
		setLoading(false)
		// TODO may want to debounce
		const onScroll = () => {
			setScrollerAtBottom(isScrollerAtBottom(scroller))
		}
		scroller?.addEventListener('scroll', onScroll)
		return () => {
			scroller?.removeEventListener('scroll', onScroll)
		}
	}, [])

	// when new items are added to the scroller content, the scroll height will change
	// when this happens, we scroll to the bottom again if scroller was at the bottom
	useLayoutEffect(() => {
		const scroller = scrollerRef.current
		if (!scroller) return

		// if currently scrolling, keep scrolling
		// (this is necessary in case the scroll height changes before the last scrollTo ends)
		// or if it was at the bottom, start scrolling
		if (scrollingToBottomRef.current || scrollerAtBottomRef.current) {
			scrollingToBottomRef.current = true
			scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
		}
	}, [...heightDeps, scrollerRef.current?.scrollHeight])

	// when we finish scrolling to the bottom, we recalculate the loader height
	// hoping it will eventually disapear entirely
	// this is needed because the onScrollEnd event is not supported by Safari
	useEffect(() => {
		const scroller = scrollerRef.current
		const scrollerContent = scrollerContentRef.current
		if (!scroller || !scrollerContent) return

		// here we recalculate if the scroller is at the bottom because the value
		// from the state variable scrollerAtBottom is be from before any animation
		// was started by scrollTo, so it is out of date
		const currScrollerAtBottom = isScrollerAtBottom(scroller)
		// if scroller is at the bottom,
		// we update the loader height, hoping it will vanish
		if (currScrollerAtBottom) {
			scrollingToBottomRef.current = false
			const newLoaderHeight = Math.max(0, scroller.clientHeight - scrollerContent.clientHeight)
			setLoaderHeight(`${newLoaderHeight}px`)
		}
	}, [scrollerAtBottom])

	return (
		// TODO pass div props forward to customize, and consider using Box
		// TODO consider hiding the scrollbar until after the first scroll to bottom
		<div
			ref={scrollerRef}
			style={{
				height: '100%',
				overflowY: loading ? 'hidden' : 'scroll',
			}}
		>
			<Stack alignItems={'center'} justifyContent={'center'} height={loaderHeight}>
				{/* TODO Make a slot for the loader so it can be changed via props */}
				{loading && <CircularProgress />}
			</Stack>
			<div ref={scrollerContentRef}>{children}</div>
		</div>
	)
}

function isScrollerAtBottom(scroller: HTMLElement) {
	const currScrollHeight = scroller.scrollHeight
	const currBottomScroll = scroller.scrollTop + scroller.clientHeight
	return currBottomScroll === currScrollHeight
}
