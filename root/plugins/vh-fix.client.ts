export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    const AddressBarRatio = 1.2; // Extra space occupied by the address bar.

    function updateVh(): void {
      document.documentElement.style.setProperty('--vh', `${(window.innerHeight * AddressBarRatio) / 100}px`);
    }

    window.addEventListener('orientationchange', updateVh);
    updateVh();
  }
});
