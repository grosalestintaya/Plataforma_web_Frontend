import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
import Audio from "../../base/Media/Audio";
import Video from "../../base/Media/Video";
import ProgressBar from "../../base/Media/ProgressBar";
import Button from "../../base/Action/Button";
import Input from "../../base/Action/Input";
import Card from "../container/Card";
import Modal from "../container/Modal";
import Form from "../iteractive/Form";
import TextField from "../container/TextField";
import ShowCard from "./ShowCard";
import CollageCard from "./CollageCard";
import IteractionComplete from "../iteractive/IteractionComplete";
import FlipCard from "../iteractive/cardIteraction/FlipCard";
import ZoomableFrame from "../iteractive/cardIteraction/ZoomableCard";
import MemoryPairs from "../iteractive/MemoryPairs";
import ChooseOne from "../iteractive/ChooseOne";
import Crossword from "../iteractive/crossword/Crossword";
import Calculator from "../iteractive/Calculator";
import Shopping from "../iteractive/Shopping";
import ClasifyCard from "../iteractive/ClasifyCard";
import { cn } from "@/shared/libs/utils";

const GROUP_BLOCKS = {
  Typography,
  Image,
  Audio,
  Video,
  ProgressBar,
  Button,
  Input,
  Card,
  Modal,
  Form,
  TextField,
  ShowCard,
  CollageCard,
  IteractionComplete,
  FlipCard,
  ZoomableFrame,
  MemoryPairs,
  ChooseOne,
  Crossword,
  Calculator,
  Shopping,
  ClasifyCard,
};

const DIRECTION_CLASS = {
  column: "flex-col",
  row: "flex-row",
};

const GAP_CLASS = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
};

function resolveGapClass(gap) {
  if (typeof gap === "string" && gap.trim()) return gap;
  return GAP_CLASS[gap] ?? GAP_CLASS[3];
}

function renderGroupItem(item, index) {
  if (!item || item.hidden) return null;

  const blockName = item.block ?? item.component;
  const {
    id,
    key,
    block,
    component,
    grow = false,
    shrink = true,
    wrapperClassName,
    props = {},
    children,
    ...rest
  } = item;

  const itemKey = key ?? id ?? `${blockName ?? "item"}-${index}`;

  if (blockName === "ComposeGroup") {
    return (
      <div key={itemKey} className={cn("w-full min-w-0", wrapperClassName)}>
        <ComposeGroup {...rest} {...props}>
          {children}
        </ComposeGroup>
      </div>
    );
  }

  const Comp = GROUP_BLOCKS[blockName];

  if (!Comp) return null;

  const mergedProps = {
    ...rest,
    ...props,
    className: cn(rest.className, props.className),
  };

  return (
    <div
      key={itemKey}
      className={cn(
        "w-full min-w-0",
        grow && "flex-1",
        !shrink && "shrink-0",
        wrapperClassName,
      )}
    >
      {children !== undefined ? <Comp {...mergedProps}>{children}</Comp> : <Comp {...mergedProps} />}
    </div>
  );
}

export default function ComposeGroup({
  items = [],
  direction = "column",
  gap = 3,
  className = "",
}) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const renderedItems = items.map(renderGroupItem).filter(Boolean);

  if (renderedItems.length === 0) return null;

  return (
    <section
      className={cn(
        "flex min-h-0 min-w-0 w-full items-stretch",
        DIRECTION_CLASS[direction] ?? DIRECTION_CLASS.column,
        resolveGapClass(gap),
        className,
      )}
    >
      {renderedItems}
    </section>
  );
}
