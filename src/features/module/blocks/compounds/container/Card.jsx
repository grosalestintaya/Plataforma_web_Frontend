import CardBase from "./CardBase";
import { resolveCardInteractions } from "../iteractive/cardIteraction/cardInteractionRegistry";
import { cn } from "@/shared/libs/utils";

function renderEnhancers(enhancers) {
  return enhancers.map((enhancer, index) => (
    <enhancer.Component
      key={enhancer.config.id ?? `${enhancer.type}-${index}`}
      interaction={enhancer.config}
    />
  ));
}

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
  className,
  overlay,
  tabIndex,
  children,
  ...cardProps
}) {
  const composition = resolveCardInteractions({
    interaction,
    media,
    zoomable,
  });
  const enhancementOverlay = renderEnhancers(composition.enhancers);
  const interactionClassName = cn(composition.hostProps.className, className);

  if (composition.primary) {
    return (
      <composition.primary.Component
        title={title}
        text={text}
        media={media}
        interaction={composition.primary.config}
        selected={selected}
        variant={variant}
        size={size}
        onSelect={onSelect}
        onComplete={onComplete}
        interactionOverlay={enhancementOverlay}
        interactionClassName={interactionClassName}
        overlay={overlay}
        tabIndex={tabIndex}
        {...cardProps}
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
      overlay={
        <>
          {overlay}
          {enhancementOverlay}
        </>
      }
      className={interactionClassName}
      tabIndex={tabIndex ?? composition.hostProps.tabIndex}
      {...cardProps}
    >
      {children}
    </CardBase>
  );
}
