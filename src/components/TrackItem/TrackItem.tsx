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
        <input className={css({ border: "solid 1px #222222", borderRadius: "4px" })} type="number" name="startTime" onChange={(e) => onChangeStartTime(e)} value={cue.startTime} min="0" max={duration} size={1} />
        <input className={css({ border: "solid 1px #222222", borderRadius: "4px" })} type="number" name="endTime" onChange={(e) => onChangeEndTime(e)} value={cue.endTime} min="0" max={duration} size={1} />
        <input className={css({ width: "320px", border: "solid 1px #222222", borderRadius: "4px" })} type="text" name="trackText" onChange={(e) => onChangeTrackText(e)} value={cue.text} width="200" placeholder='字幕テキストを入力してください' />
    </>)
}