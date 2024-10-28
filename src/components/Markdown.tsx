import { marked } from 'marked'
import { useMemo } from 'react'

export type MarkdownProps = {
	content: string
}

function Markdown(props: MarkdownProps) {
	const content = useMemo(() => marked.parse(props.content, { async: false }), [props.content])
	return <div dangerouslySetInnerHTML={{ __html: content }} />
}

export default Markdown
