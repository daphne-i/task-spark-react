import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useTaskStore } from '../store/taskStore';
import './ModalStyles.css'; // We will create this CSS file next

// Tell react-modal to hook into your app's root element
Modal.setAppElement('#root');

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ScratchPadScreen: React.FC<Props> = ({ isOpen, onClose }) => {
  // Get the state and setter from our Zustand store
  const { scratchPadText, setScratchPadText } = useTaskStore();

  // Use local state for debouncing (like in the Flutter app)
  const [localText, setLocalText] = useState(scratchPadText);

  // Update local state if the global state ever changes
  useEffect(() => {
    setLocalText(scratchPadText);
  }, [scratchPadText]);

  // Debounce saving to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      setScratchPadText(localText);
    }, 500); // Save 500ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [localText, setScratchPadText]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content" // Class for styling the modal
      overlayClassName="modal-overlay" // Class for styling the background
      closeTimeoutMS={300}
    >
      <div className="modal-header">
        <h2>Scratch Pad</h2>
        <button onClick={onClose} className="modal-close-btn">&times;</button>
      </div>
      <textarea
        className="scratch-pad-textarea"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder="Jot down quick notes here..."
      />
    </Modal>
  );
};