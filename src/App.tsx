import { css } from '../styled-system/css';
import { ChangeEventHandler, useCallback, useEffect, useRef } from 'react'
import { useSetState } from 'react-use';
import { TrackItem } from './components/TrackItem/TrackItem';
import { convertWebVtt } from './utils/convertWebVtt';

type State = {
  /**
   * 読み込んだ動画時間の長さ
   */
  duration: number;
  /**
   * 字幕作成入力ボックスの状態を管理する
   */
  vttCues: VTTCue[];
  /**
   * 設定した字幕を動画へ反映するためのデータを管理する
   */
  videoTextTrack: TextTrack | null;
  /**
   * VTT形式に変換された文字列データ
   */
  vttText: string;
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useSetState<State>({
    duration: 0,
    vttCues: [],
    videoTextTrack: null,
    vttText: ""
  });

  const generateTrackText = useCallback(() => {
    const vttText = convertWebVtt(state.vttCues)
    setState({ vttText })
  }, [setState, state.vttCues])

  const handleChangeTrackText = useCallback((i: number, value: string) => {
    const track = state.vttCues[i]
    track.text = value
    setState(state)
  }, [setState, state])

  const handleChangeStartTime = useCallback((i: number, value: number) => {
    const track = state.vttCues[i]
    track.startTime = value
    setState(state)
  }, [setState, state])

  const handleChangeEndTime = useCallback((i: number, value: number) => {
    const track = state.vttCues[i]
    track.endTime = value
    setState(state)
  }, [setState, state])

  const addTrack = useCallback(() => {
    const newVTTCue = new VTTCue(0, 0, "")
    newVTTCue.id = `${Date.now()}`
    const newVTTCues = [...state.vttCues, newVTTCue]
    state.videoTextTrack?.addCue(newVTTCue)
    setState({ videoTextTrack: state.videoTextTrack, vttCues: newVTTCues })
  }, [setState, state.videoTextTrack, state.vttCues])

  const deleteTrack = useCallback((id: string) => {
    const deleteTargetIndex = state.vttCues.findIndex((cue) => cue.id === id)
    if (deleteTargetIndex === -1) {
      return
    }
    state.vttCues.splice(deleteTargetIndex, 1)
    setState({ vttCues: state.vttCues })
    if (!state.videoTextTrack?.cues) {
      return
    }
    const deleteTargetTextTrack = Object.entries(state.videoTextTrack.cues).find(([, value]) => value.id === id)
    if (!deleteTargetTextTrack) {
      return
    }
    const [, cue] = deleteTargetTextTrack
    state.videoTextTrack.removeCue(cue)
    setState({ videoTextTrack: state.videoTextTrack })
  }, [setState, state.videoTextTrack, state.vttCues])

  const handleChangeMovieFile: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const files = e.currentTarget.files
    if (!files) {
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener("load", (e) => {
      if (!videoRef.current) {
        return
      }
      const source = (e.target?.result ?? "") as string
      videoRef.current.setAttribute("src", source)
    })
    fileReader.readAsDataURL(files[0])
  }, [])

  const downloadVttFile = useCallback(() => {
    const blob = new Blob([state.vttText], { type: "application/octet-stream;charset=utf-8" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const now = Date.now()
    link.download = `${now}.vtt`;
    link.click();
  }, [state.vttText])

  const setupTextTrack = useCallback((video: HTMLVideoElement) => {
    if (Object.entries(video.textTracks).length !== 0) {
      return
    }
    const textTrack = video.addTextTrack("captions", "", "ja")
    textTrack.mode = "showing"
    setState({ videoTextTrack: textTrack })
  }, [setState])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    setupTextTrack(video)
    
    video.addEventListener("durationchange", () => {
      setState({ duration: Math.floor(video.duration) })
    })
    window.addEventListener("beforeunload", (e) => {
      if (state.vttCues.length === 0 && (state.videoTextTrack?.cues?.length ?? 0) === 0) {
        return
      }
      e.returnValue = "編集をやめてページを離れますか？"; // Google Chromeのみ機能する
    })
  }, [setState, setupTextTrack, state.videoTextTrack, state.vttCues.length])
  return (
    <div className={css({display: "flex", flexDirection: "column", margin: "0 auto" })}>
      <h1 className={css({ margin: "8px 0", fontSize: "2rem", fontWeight: "bold" })}>WebVTTジェネレーター </h1>
      <p className={css({ display: "flex", justifyContent: "center", textAlign: "left", fontSize: "12px", margin: "12px 0" })}>このツールは動画で字幕表示を確認しながらVTT形式のファイルを作成できるツールです。使い方はとても簡単で右側のペインで字幕作成したい動画を読み込ませた後、左側のペインで字幕を追加していきます。<br />「プレビュー」ボタンをクリックすることで動画へ作成した字幕を反映できます。また動画下にVTT形式でファイルの中身が表示され「.vttをダウンロード」ボタンをクリックすることでVTT形式のファイルがお手元にダウンロードされます。</p>
      <div className={css({ display: "flex", justifyContent: "center", gap: "16px" })}>
      <div className={css({ flexGrow: 1, overflowY: "scroll", border: "1px solid #222222" })} >
        <div className={css({display: "flex", gap: "16px", justifyContent: "center", margin: "16px 0"})}>
          <button className={css({ backgroundColor: "#007bff", color: "#ffffff", width: "200px", fontSize: "12px", fontWeight: "bold", padding: "4px 0", borderRadius: "4px", _hover: { opacity: "0.7", cursor: "pointer" }})} onClick={addTrack} >追加</button>
          <button className={css({ backgroundColor: "#ffc107", color: "#222222", width: "200px", fontSize: "12px", fontWeight: "bold", padding: "4px 0", borderRadius: "4px", _hover: { opacity: "0.7", cursor: "pointer" } })} onClick={generateTrackText}>プレビュー</button>
        </div>
        <ul className={css({ padding: 0 })}>
          {state.vttCues.length !== 0 ? state.vttCues.map((cue, index) => {
            return (<li className={css({ padding: "4px 0", listStyleType: "none", gap: "8px", display: "flex", justifyContent: "center" })} key={cue.id}>
              <span className={css({ fontSize: "18px", fontWeight: "bold" })}>{index + 1}</span>
              <TrackItem cue={cue} duration={state.duration} onChangeTrackText={(e) => handleChangeTrackText(index, e.currentTarget.value)} onChangeStartTime={(e) => handleChangeStartTime(index, Number.parseInt(e.currentTarget.value))} onChangeEndTime={(e) => handleChangeEndTime(index, Number.parseInt(e.currentTarget.value))} ></TrackItem>
              <button className={css({ backgroundColor: "#dc3545", color: "#ffffff", width: "72px", fontSize: "12px", fontWeight: "bold", padding: "4px 0", borderRadius: "4px", _hover: { opacity: "0.7", cursor: "pointer" }})} onClick={() => deleteTrack(cue.id)}>削除</button>
            </li>)
          }) : <p>動画を読み見込ませてテキストトラックを追加しましょう！</p>}
        </ul>
      </div>
      <div className={css({ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 })}>
        <input type="file" id="movieFile" accept='.mp4' onChange={handleChangeMovieFile} />
        <video ref={videoRef} controls className={css({width: "100%"})}/>
        <textarea className={css({textAlign: "left", border: "solid 1px #222222", borderRadius: "4px", height: "300px", resize: "none", width: "100%"})} rows={10} value={state.vttText} />
        <div className={css({ display: "flex", justifyContent: "center" })}>
        <button className={css({ backgroundColor: "#ffc107", color: "#222222", width: "200px", fontSize: "12px", fontWeight: "bold", padding: "8px 0", borderRadius: "4px", _hover: { opacity: "0.7", cursor: "pointer" }})} onClick={downloadVttFile}>.vttをダウンロード</button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default App
