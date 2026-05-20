import CardBase from "./CardBase";
import { getCardInteractionComponent } from "../iteractive/cardIteraction/cardInteractionRegistry";

export default function Card({
  title,
  text,
  media,
  interaction,
  selected = false,
  zoomable = true,
  variant = "default",
  size = "normal",
  onSelect,
  onComplete,
}) {
  const { Component: InteractionComponent, interaction: resolvedInteraction } =
    getCardInteractionComponent({
      interaction,
      media,
      zoomable,
    });

  if (InteractionComponent) {
    return (
      <InteractionComponent
        title={title}
        text={text}
        media={media}
        interaction={resolvedInteraction}
        selected={selected}
        variant={variant}
        size={size}
        onSelect={onSelect}
        onComplete={onComplete}
      />
    );
  }

  return (
    <CardBase
      title={title}
      text={text}
      media={media}
      selected={selected}
      variant={variant}
      size={size}
    />
  );
}
