export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
