import { Button, TextField } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import { Dispatch, RefObject, SetStateAction } from 'react'
import { HeyGenAvatarStreamHandle } from './HeyGenAvatarStream'

const AVATARS = [
	{
		avatar_id: 'Eric_public_pro2_20230608',
		name: 'Edward in Blue Shirt',
	},
	{
		avatar_id: 'Tyler-incasualsuit-20220721',
		name: 'Tyler in Casual Suit',
	},
	{
		avatar_id: 'Anna_public_3_20240108',
		name: 'Anna in Brown T-shirt',
	},
	{
		avatar_id: 'Susan_public_2_20240328',
		name: 'Susan in Black Shirt',
	},
	{
		avatar_id: 'josh_lite3_20230714',
		name: 'Joshua Heygen CEO',
	},
]

const AVATAR_MAP = AVATARS.reduce((acc, avatar) => {
	acc.set(avatar.avatar_id, avatar.name)
	return acc
}, new Map<string, string>())

const AVATAR_OPTIONS = Array.from(AVATAR_MAP.keys())

const VOICES = [
	{
		voice_id: '077ab11b14f04ce0b49b5f6e5cc20979',
		language: 'English',
		gender: 'Male',
		name: 'Paul - Natural',
		preview_audio: 'https://static.heygen.ai/voice_preview/k6dKrFe85PisZ3FMLeppUM.mp3',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '131a436c47064f708210df6628ef8f32',
		language: 'English',
		gender: 'Female',
		name: 'Amber - Friendly',
		preview_audio: 'https://static.heygen.ai/voice_preview/5HHGT48B6g6aSg2buYcBvw.wav',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '0ebe70d83b2349529e56492c002c9572',
		language: 'English',
		gender: 'Male',
		name: 'Antoni - Friendly',
		preview_audio: 'https://static.heygen.ai/voice_preview/TwupgZ2az5RiTnmAifPmmS.mp3',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '1bd001e7e50f421d891986aad5158bc8',
		language: 'English',
		gender: 'Female',
		name: 'Sara - Cheerful',
		preview_audio: 'https://static.heygen.ai/voice_preview/func8CFnfVLKF2VzGDCDCR.wav',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '001cc6d54eae4ca2b5fb16ca8e8eb9bb',
		language: 'Spanish',
		gender: 'Male',
		name: 'Elias - Natural',
		preview_audio: 'https://static.heygen.ai/voice_preview/JmCb3rgMZnCjCAA9aacnGj.wav',
		support_pause: false,
		emotion_support: false,
	},
	{
		voice_id: '00988b7d451d0722635ff7b2b9540a7b',
		language: 'Portuguese',
		gender: 'Female',
		name: 'Brenda - Professional',
		preview_audio: 'https://static.heygen.ai/voice_preview/fec6396adb73461c9997b2c0d7759b7b.wav',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '00c8fd447ad7480ab1785825978a2215',
		language: 'Chinese',
		gender: 'Female',
		name: 'Xiaoxuan - Serious',
		preview_audio: 'https://static.heygen.ai/voice_preview/909633f8d34e408a9aaa4e1b60586865.wav',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '00ed77fac8b84ffcb2ab52739b9dccd3',
		language: 'Latvian',
		gender: 'Male',
		name: 'Nils - Affinity',
		preview_audio: 'https://static.heygen.ai/voice_preview/KwTwAz3R4aBFN69fEYQFdX.wav',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '02bec3b4cb514722a84e4e18d596fddf',
		language: 'Arabic',
		gender: 'Female',
		name: 'Fatima - Professional',
		preview_audio: 'https://static.heygen.ai/voice_preview/930a245487fe42158c810ac76b8ddbab.wav',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '04e95f5bcb8b4620a2c4ef45b8a4481a',
		language: 'Ukrainian',
		gender: 'Female',
		name: 'Polina - Professional',
		preview_audio: 'https://static.heygen.ai/voice_preview/ntekV94yFpvv4RgBVPqW7c.wav',
		support_pause: true,
		emotion_support: false,
	},
	{
		voice_id: '071d6bea6a7f455b82b6364dab9104a2',
		language: 'German',
		gender: 'Male',
		name: 'Jan - Natural',
		preview_audio: 'https://static.heygen.ai/voice_preview/fa3728bed81a4d11b8ccef10506af5f4.wav',
		support_pause: true,
		emotion_support: false,
	},
]

const VOICE_MAP = VOICES.reduce((acc, voice) => {
	acc.set(voice.voice_id, `${voice.name} | ${voice.language} | ${voice.gender}`)
	return acc
}, new Map<string, string>())

const VOICE_OPTIONS = Array.from(VOICE_MAP.keys())

export type HeyGenAvatarControlsValue = {
	avatarId?: string
	voiceId?: string
}

export type HeyGenAvatarControlsProps = {
	avatarStreamRef: RefObject<HeyGenAvatarStreamHandle>
	value?: HeyGenAvatarControlsValue
	onChange?: Dispatch<SetStateAction<HeyGenAvatarControlsValue>>
	isStreaming?: boolean
	setIsStreaming?: Dispatch<SetStateAction<boolean>>
}

export default function HeyGenAvatarControls({
	value,
	onChange,
	avatarStreamRef,
	isStreaming,
	setIsStreaming,
}: HeyGenAvatarControlsProps) {
	return (
		<Stack spacing={2}>
			<Stack spacing={2} direction="row" justifyItems="stretch">
				<Autocomplete
					fullWidth
					id="avatarIdField"
					freeSolo
					value={value?.avatarId}
					onChange={(_event, newAvatarId) => {
						onChange?.((value) =>
							Object.assign({}, value, {
								avatarId: newAvatarId,
							}),
						)
					}}
					options={AVATAR_OPTIONS}
					getOptionLabel={(option) => AVATAR_MAP.get(option) ?? option}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Avatar ID"
							InputProps={{
								...params.InputProps,
								type: 'search',
							}}
						/>
					)}
				/>

				<Autocomplete
					fullWidth
					id="voiceIdField"
					freeSolo
					value={value?.voiceId}
					onChange={(_event, newVoiceId) => {
						onChange?.((value) =>
							Object.assign({}, value, {
								voiceId: newVoiceId,
							}),
						)
					}}
					options={VOICE_OPTIONS}
					getOptionLabel={(option) => VOICE_MAP.get(option) ?? option}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Voice ID"
							InputProps={{
								...params.InputProps,
								type: 'search',
							}}
						/>
					)}
				/>
			</Stack>

			<Stack spacing={2} direction="row" justifyItems="stretch">
				{isStreaming ? (
					<Button size="medium" fullWidth onClick={() => setIsStreaming?.(false)} variant="outlined">
						End session
					</Button>
				) : (
					<Button size="medium" fullWidth onClick={() => setIsStreaming?.(true)} variant="outlined">
						Start session
					</Button>
				)}

				<Button size="medium" fullWidth onClick={() => void avatarStreamRef.current?.interrupt()} variant="outlined">
					Interrupt task
				</Button>
			</Stack>
		</Stack>
	)
}
