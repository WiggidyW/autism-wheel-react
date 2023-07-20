import { ReactElement, RefObject, useRef, useState } from "react";
import { Unstable_Grid2 as Grid, Card, Typography } from "@mui/material";
import { SizeKind, useSize } from "./Size";
import { NAV_BAR_HEIGHT, NavBar } from "./NavBar";
import { Delete } from "@mui/icons-material";
import { CardTitle, PaddedCardContent, SelectableCard } from "./MuiExt";
import { Previewable } from "./Preview";

interface Selectable extends Previewable {
  deleteStorage: () => void;
  name: string;
}

const Selector = <S extends Selectable>(props: {
  selectables: S[];
  onSelect: (s: S) => void;
  goBack: () => void;
  itemKind: string;
  titledItems?: boolean;
  deletable?: boolean;
  onCreate?: () => void;
  onEmpty?: () => ReactElement;
  isEmpty?: boolean;
}) => {
  const {
    selectables,
    onSelect,
    onCreate,
    titledItems,
    goBack,
    itemKind,
    deletable,
    onEmpty,
    isEmpty,
  } = props;
  const viewRef = useRef<HTMLDivElement>(null);

  const empty = (() => {
    // If isEmpty is not undefined, then it determines empty
    if (isEmpty !== undefined) return isEmpty;
    // If isEmpty is undefined, then selectables length determines empty
    return selectables.length === 0;
  })();

  return (
    <>
      <NavBar title={`Select a ${itemKind}`} goBack={goBack} />
      <Grid
        container
        spacing={2}
        justifyContent={"center"}
        alignItems={"center"}
        height={`calc(100% - ${NAV_BAR_HEIGHT}px)`}
        width={"100%"}
        ref={viewRef}
        marginTop={`${NAV_BAR_HEIGHT - 8}px`} // I don't know why it needs the -8px
        sx={{ "& .MuiCardContent-root:last-child": { paddingBottom: "8px" } }}
      >
        {/* If onEmpty is not undefined, and empty is true, then render it. */}
        {onEmpty && empty ? (
          onEmpty()
        ) : (
          <>
            {onCreate === undefined ? null : (
              <SelectorItem
                onSelect={onCreate}
                selectable={SelectableAddNew(itemKind)}
                size={SizeKind.select}
                titled={titledItems}
                viewRef={viewRef}
              />
            )}
            {selectables.map((selectable) => (
              <SelectorItem
                key={`${selectable.name}`}
                onSelect={() => onSelect(selectable)}
                selectable={selectable}
                size={SizeKind.select}
                titled={titledItems}
                viewRef={viewRef}
                deletable={deletable}
              />
            ))}
          </>
        )}
      </Grid>
    </>
  );
};

const SelectorItem = (props: {
  selectable: Selectable;
  size: SizeKind;
  viewRef?: RefObject<Element>;
  titled?: boolean;
  onSelect: () => void;
  deletable?: boolean;
}) => {
  const { selectable, titled, size, viewRef, onSelect, deletable } = props;
  const [deleted, setDeleted] = useState(false);
  return deleted ? null : (
    <Grid>
      <Card>
        <PaddedCardContent>
          <SelectableCard
            onSelect={onSelect}
            tooltip={selectable.previewDesc && selectable.previewDesc()}
          >
            {titled ? <CardTitle title={selectable.name} /> : null}
            <div
              style={{
                padding: "8px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {selectable.preview(size, viewRef)}
            </div>
          </SelectableCard>
        </PaddedCardContent>
        {deletable ? (
          <PaddedCardContent>
            <SelectableCard
              onSelect={() => {
                selectable.deleteStorage();
                setDeleted(true);
              }}
            >
              <Delete />
            </SelectableCard>
          </PaddedCardContent>
        ) : null}
      </Card>
    </Grid>
  );
};

const SelectableAddNew = (itemKind: string): Selectable => ({
  name: "New",
  deleteStorage: () => {},
  preview: (sizeKind: SizeKind, viewRef?: RefObject<Element>) => {
    const PlusIcon = (props: {
      sizeKind: SizeKind;
      viewRef?: RefObject<Element>;
    }): ReactElement => {
      const { sizeKind, viewRef } = props;
      const size = useSize(sizeKind, viewRef);
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line
            x1="0"
            y1={size / 2}
            x2={size}
            y2={size / 2}
            stroke="black"
            strokeWidth={size / 12}
          />
          <line
            x1={size / 2}
            y1="0"
            x2={size / 2}
            y2={size}
            stroke="black"
            strokeWidth={size / 12}
          />
        </svg>
      );
    };
    return <PlusIcon sizeKind={sizeKind} viewRef={viewRef} />;
  },
  previewDesc: (): ReactElement => (
    <Typography>{`Create a new ${itemKind}`}</Typography>
  ),
});

export type { Selectable, Previewable };
export { Selector };

export default Selector;
