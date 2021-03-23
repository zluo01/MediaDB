import { ICardSize, IFolderInfo, IReduxState } from '../../type';
import { FixedSizeGrid as Grid } from 'react-window';
import MovieCard from '../MovieCard';
import AutoSizer from 'react-virtualized-auto-sizer';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { openFile } from '../../utils/electron';

interface IContentProps {
  folderData: IFolderInfo;
  cardSize: ICardSize;
}

function Content({ folderData, cardSize }: IContentProps): JSX.Element {
  const [currIndex, setCurrIndex] = useState(-1);

  const cWidth = cardSize.width + 15;
  const cHeight = cardSize.height + 60;

  const contentState = React.useRef(currIndex);

  function setIndex(index: number) {
    contentState.current = index;
    setCurrIndex(index);
  }

  function handleKeyPress(ev: KeyboardEvent) {
    switch (ev.key) {
      case 'ArrowLeft':
        setIndex(
          contentState.current - 1 < 0
            ? folderData.data.length - 1
            : contentState.current - 1
        );
        break;
      case 'ArrowRight':
        setIndex((contentState.current + 1) % folderData.data.length);
        break;
      case 'Enter':
        openFile(folderData.data[contentState.current].file);
        break;
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [folderData]);

  return (
    <AutoSizer>
      {({ width }) => {
        const columnNumber = Math.floor(width / cWidth);
        const rowNumber = Math.ceil(folderData.data.length / columnNumber);
        const w = (width - columnNumber * cWidth - 1) / (columnNumber * 2);
        return (
          <>
            <Grid
              columnCount={columnNumber}
              columnWidth={cWidth + w * 2}
              rowCount={rowNumber}
              rowHeight={cHeight}
              height={cHeight * rowNumber + 10}
              width={width}
              itemData={{
                media: folderData.data,
                size: cardSize,
              }}
            >
              {({ style, columnIndex, rowIndex, data }) => {
                const index = rowIndex * columnNumber + columnIndex;
                if (index >= data.media.length) return null;
                return (
                  <MovieCard
                    style={style}
                    media={data.media[index]}
                    size={data.size}
                    select={() => setIndex(index)}
                    selected={currIndex === index}
                  />
                );
              }}
            </Grid>
          </>
        );
      }}
    </AutoSizer>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  cardSize: state.setting.cardSize,
});

export default connect(mapStateToProps)(Content);
