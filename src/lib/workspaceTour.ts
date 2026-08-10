export const WORKSPACE_TOUR_EVENT = 'algoglyph:start-workspace-tour';

export const startWorkspaceTour = (): void => {
  window.dispatchEvent(new Event(WORKSPACE_TOUR_EVENT));
};
