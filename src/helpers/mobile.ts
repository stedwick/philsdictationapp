const isMobile = !!navigator?.userAgentData?.mobile;
const isDesktop = !isMobile;

export { isMobile, isDesktop };
