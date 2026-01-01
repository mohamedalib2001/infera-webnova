import { useState } from "react";
import type { Viewport, BottomTab, RightTab } from "../utils/ide-types";

export function usePanelVisibility() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");
  const [rightTab, setRightTab] = useState<RightTab>("tools");

  const toggleSidebar = () => setShowSidebar((prev) => !prev);
  const toggleRightPanel = () => setShowRightPanel((prev) => !prev);
  const toggleBottomPanel = () => setShowBottomPanel((prev) => !prev);

  return {
    showSidebar,
    setShowSidebar,
    toggleSidebar,
    showRightPanel,
    setShowRightPanel,
    toggleRightPanel,
    showBottomPanel,
    setShowBottomPanel,
    toggleBottomPanel,
    viewport,
    setViewport,
    bottomTab,
    setBottomTab,
    rightTab,
    setRightTab,
  };
}
