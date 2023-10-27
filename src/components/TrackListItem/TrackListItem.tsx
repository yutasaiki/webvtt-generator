import { XYCoord, useDrag, useDrop } from "react-dnd";
import { css } from "../../../styled-system/css";
import { Track, TrackProps } from "../Track/Track";
import { useRef } from "react";
import draggableIcon from '../../assets/draggble.svg';

export const ItemTypes = {
    TRACK_ITEM: 'trackItem'
}

type DragItem = {
    index: number;
    id: string;
    type: string;
};

export function TrackListItem({
    index,
    cue,
    duration,
    onSortEnd,
    onDelete,
    onChangeTrackText,
    onChangeStartTime,
    onChangeEndTime }: { index: number; onSortEnd: (dragIndex: number, hoverIndex: number) => void; onDelete: () => void } & TrackProps) {
    const listItemRef = useRef<HTMLLIElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TRACK_ITEM,
        item: () => {
            return { id: cue.id, index }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }))

    const [, drop] = useDrop<DragItem>(() => ({
        accept: [ItemTypes.TRACK_ITEM],
        hover(item, monitor) {
            if (!listItemRef.current) {
                return;
            }

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return;
            }

            // アイテムのサイズ
            const hoverBoundingRect = listItemRef.current?.getBoundingClientRect();

            // ホバー時のボックスの中心の値
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // マウス位置
            const clientOffset = monitor.getClientOffset();

            // 要素が重なった場合のアイテム上のマウス位置を取得
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            // 下にドラッグする場合、マウスが項目の高さの半分を下回った時のみ移動を実行
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // 上にドラッグする場合、マウスが項目の高さの半分を超えた時のみ移動を実行
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            onSortEnd(dragIndex, hoverIndex);
            item.index = hoverIndex;
        }
    }))
    drag(drop(listItemRef))
    return (<li ref={listItemRef} className={css({ padding: "4px 8px", listStyleType: "none", gap: "8px", display: "flex", justifyContent: "center", opacity: isDragging ? 0.5 : 1, cursor: 'move', width: "100%" })}>
        <img src={draggableIcon} className={css({ margin: "0 8px"})}/>
        <span className={css({ fontSize: "18px", fontWeight: "bold" })}>{index + 1}</span>
        <Track cue={cue} duration={duration} onChangeTrackText={onChangeTrackText} onChangeStartTime={onChangeStartTime} onChangeEndTime={onChangeEndTime} />
        <button className={css({ backgroundColor: "#dc3545", color: "#ffffff", width: "72px", fontSize: "12px", fontWeight: "bold", padding: "4px 0", borderRadius: "4px", _hover: { opacity: "0.7", cursor: "pointer" } })} onClick={onDelete}>削除</button>
    </li>)
}