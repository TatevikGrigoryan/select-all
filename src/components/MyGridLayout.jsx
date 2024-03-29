import RGL, {WidthProvider} from "react-grid-layout";
import {useEffect, useState} from "react";
import '../styles/components/myGridLayout.css'
import position from '../assets/position.svg'

const ReactGridLayout = WidthProvider(RGL);

const MyGridLayout = () => {
  const [selectAllMode, setSelectAllMode] = useState(false)
  const [mouseDown, setMouseDown] = useState(false)
  const [dragStart, setDragStart] = useState(false)
  const [startPosition, setStartPosition] = useState(null)
  const [layout, setLayout] = useState([])
  const [oldLayout, setOldLayout] = useState([])
  const [selectedElementsIdx, setSelectedElementsIdx] = useState([])

  const generateLayout = () => {
    return Array.apply(null, new Array(10)).map(function (item, i) {
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * 5,
        w: 2,
        h: 5,
        i: i.toString()
      };
    })
  }

  useEffect(() => {
    setLayout(generateLayout);
    const handleMouseDown = () => {setMouseDown(true)};

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [])

  useEffect(() => {
    const handleOnDrag = (event) => {

      //condition for starting move
      if (!startPosition && mouseDown) {
        const x = Math.floor(event.clientX * 12 / window.screen.width);
        const y = Math.floor(event.clientY * 30 / window.screen.height);

        if (selectedElementsIdx.length > 1) {
          setSelectAllMode(true);
          setStartPosition({x, y})
          setOldLayout(JSON.parse(JSON.stringify(layout)))
        }
      }

      if (selectAllMode) {
        const x = Math.floor(event.clientX * 12 / window.screen.width);
        const y = Math.floor(event.clientY * 30 / window.screen.height);

        const diffX = x - startPosition.x;
        const diffY = y - startPosition.y;

        const newLayout = JSON.parse(JSON.stringify(oldLayout)).map(item => {
          if (selectedElementsIdx.includes(item.i)) {
            item.x = item.x + diffX < 0 ? 0 : item.x + diffX;
            item.y += diffY;
          }

          return item;
        })

        setLayout(newLayout);
      }
    };

    const handleMouseUp = () => {
      setMouseDown(false)

      if (selectAllMode) {
        setSelectAllMode(false);
        setSelectedElementsIdx([])
        setStartPosition(null)
      }
    }

    window.addEventListener('mousemove', handleOnDrag);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleOnDrag);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedElementsIdx,selectAllMode, layout, mouseDown, startPosition]);

  const handleSelect = (i) => {
    if (dragStart) {
      setDragStart(false);

      return;
    }

    let newSelectedItemIdx = [...selectedElementsIdx];

    if (selectedElementsIdx.includes(i)) {
      newSelectedItemIdx = selectedElementsIdx.filter(item => item !== i);
    } else {
      newSelectedItemIdx.push(i);
    }

    setSelectedElementsIdx(newSelectedItemIdx)
  }

  const isSelected = (i) => {
    return selectedElementsIdx.includes(i)
  }

  const handlePosUp = (i, event) => {
    event.stopPropagation();
    const newLay = layout.map(item => {
      if (item.i === i.i) {
        item.zIndex = item.zIndex < 10 ? ++item.zIndex : 10;
      }

      return item;
    });

    setLayout(newLay);
  }

  const handlePosDown = (i, event) => {
    event.stopPropagation()
    const newLay = layout.map(item => {
      if (item.i === i.i) {
        item.zIndex = item.zIndex > 1 ? --item.zIndex : 0;
      }

      return item;
    });

    setLayout(newLay);
  }

  const handleStop= (lay, oldItem, newItem) => {
    setDragStart(true);
    const newLayout = layout.map(item => {
      if (item.i === newItem.i) {
        return {
          ...item,
          ...newItem
        }
      }

      return item
    })
    setLayout(newLayout)
  }

  return (
    <ReactGridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      useCSSTransforms={true}
      allowOverlap={true}
      isDraggable={selectedElementsIdx.length < 1}
      onDragStop={handleStop}
    >
      {layout.map((item, index) => (
        <div
          key={index}
          style={{background: 'red', zIndex: item.zIndex ? item.zIndex : 'unset'}}
          data-grid={{...item, x: item.x, y: item.y, w: item.w, h: item.h,}}
          // className={isSelected(item.i) ? 'react-grid-selected' : ''}
          onClick={(event) => handleSelect(item.i, event)}
        >
          <div className={isSelected(item.i) ? 'react-grid-selected' : ''}></div>
          <div style={{height: '40px'}}>
            {item.i}
            {isSelected(item.i) && (
              <div className='react-grid-position-block'>
                <img src={position}/>
                <div>
                  <div onClick={(event) => handlePosUp(item, event)}>+</div>
                  <div onClick={(event) => handlePosDown(item, event)}>-</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </ReactGridLayout>
  )
}

export default MyGridLayout