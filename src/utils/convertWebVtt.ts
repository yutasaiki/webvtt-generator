function convertWebVTTTimeFormat(second: number) {
    const hour = Math.floor(second % 86400 / 3600);
    const min = Math.floor(second % 3600 / 60);
    const sec = second % 60;
    return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.000`
}

/**
 * WebVTT形式の文字列へ変換する
 * 
 * @param vttCues VTTCueのオブジェクト配列
 * @returns WebVTT形式の文字列
 */
export function convertWebVtt(vttCues: VTTCue[]) {
    const vttLines: string[] = []
    vttCues.map((vttCue) => {
        vttLines.push(`${convertWebVTTTimeFormat(vttCue.startTime)} --> ${convertWebVTTTimeFormat(vttCue.endTime)}`)
        vttLines.push(`${vttCue.text}`)
        vttLines.push("")
    })

    const webvttList = ["WEBVTT", "", ...vttLines, ""]
    return webvttList.join("\n")
}