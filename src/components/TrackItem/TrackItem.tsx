import { css } from '../../../styled-system/css';
import { ChangeEventHandler } from "react"

export function TrackItem({
    cue,
    duration,
    onChangeTrackText,
    onChangeStartTime,
    onChangeEndTime
}: {
    cue: VTTCue
    duration: number
    onChangeTrackText: ChangeEventHandler<HTMLInputElement>
    onChangeStartTime: ChangeEventHandler<HTMLInputElement>
    onChangeEndTime: ChangeEventHandler<HTMLInputElement>
}) {
    return (<>
        <input type="number" name="startTime" onChange={(e) => onChangeStartTime(e)} value={cue.startTime} min="0" max={duration} size={1} />
        <input type="number" name="endTime" onChange={(e) => onChangeEndTime(e)} value={cue.endTime} min="0" max={duration} size={1} />
        <input type="text" name="trackText" className={css({width: "320px"})} onChange={(e) => onChangeTrackText(e)} value={cue.text} width="200" placeholder='字幕テキストを入力してください' />
    </>)
}