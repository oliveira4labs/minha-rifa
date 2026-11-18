import { useEffect, useRef } from 'react';

export function Dialog({ open, onClose, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} {...props}>
      {children}
    </dialog>
  );
}
