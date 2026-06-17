import { FC, ReactNode } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';

interface TDModalProps extends Omit<ModalProps, 'onHide'> {
  children: ReactNode;
  show: boolean;
  onExited: () => void;
  handleSubmit?: () => void;
  handleCancel?: () => void;
  fullscreen?: true | string | 'sm-down' | 'md-down' | 'lg-down' | 'xl-down' | 'xxl-down';
  size?: 'sm' | 'lg' | 'xl';
  title?: string;
  footer?: ReactNode;
}

const TDModal: FC<TDModalProps> = ({
  children,
  show,
  onExited,
  handleSubmit,
  handleCancel,
  fullscreen = 'lg-down',
  size = 'xl',
  title = 'Chi tiết',
  footer,
  ...rest
}) => {
  return (
    <Modal show={show} fullscreen={fullscreen} size={size} onExited={onExited} keyboard={true} scrollable={true} onEscapeKeyDown={onExited} {...rest}>
      <Modal.Header className="px-4 py-3">
        <Modal.Title>{title}</Modal.Title>
        <button type="button" className="btn btn-icon btn-sm btn-active-light-primary ms-2" onClick={onExited} aria-label="Close">
          <i className="ki-duotone ki-cross fs-1">
            <span className="path1" />
            <span className="path2" />
          </i>
        </button>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {footer || (
          <div className="d-flex justify-content-center align-items-center">
            <button type="button" className="btn btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel}>
              <i className="fa fa-times me-2" />
              Đóng
            </button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TDModal;
