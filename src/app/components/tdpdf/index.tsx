import React, { memo, useMemo, useState, useEffect } from 'react';
import './index.css';
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  TextSelection,
  TextSearch,
  Annotation,
  FormFields,
  FormDesigner,
  PageOrganizer,
  Inject,
} from '@syncfusion/ej2-react-pdfviewer';
import { toast } from 'react-toastify';
import { API_URL } from '@/utils/baseAPI';

// Định nghĩa interface cho annotation bound và settings
interface AnnotationBound {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface AnnotationSettings {
  opacity: number;
  fillColor: string;
  strokeColor: string;
  thickness: number;
  subject: string;
}

export interface AnnotationDefaultsType {
  pageIndex: number;
  annotationType: string;
  annotationId: string;
  annotationBound: AnnotationBound;
  annotationSettings: AnnotationSettings;
}

// Giá trị mặc định của annotation
const annotationDefaults: AnnotationDefaultsType = {
  pageIndex: 0,
  annotationType: 'Rectangle',
  annotationId: '',
  annotationBound: { left: 0, top: 0, width: 0, height: 0 },
  annotationSettings: {
    opacity: 1,
    fillColor: '#ffffff00',
    strokeColor: '#ff0000',
    thickness: 1,
    subject: 'Rectangle',
  },
};

// Định nghĩa interface cho các props của TDPdf
interface TDPdfProps {
  documentPath: string;
  onSave: (annotation: string) => void;
  annotationSaved: string | null;
}

// Interface cho các tham số annotation từ sự kiện (có thể tùy chỉnh thêm nếu cần)
interface AnnotationArgs {
  annotationType: string;
  annotationId: string;
  pageIndex: number;
  annotationBound: AnnotationBound;
}

const TDPdf: React.FC<TDPdfProps> = memo(({ documentPath, onSave, annotationSaved }) => {
  // Sử dụng useMemo để parse annotationSaved chỉ khi nó thay đổi
  const annotation: AnnotationDefaultsType = useMemo(() => {
    if (!annotationSaved) {
      return annotationDefaults;
    }
    try {
      return { ...annotationDefaults, ...JSON.parse(annotationSaved) };
    } catch (error) {
      console.error('Error parsing annotationSaved', error);
      return annotationDefaults;
    }
  }, [annotationSaved]);

  const [annotationData, setAnnotationData] = useState<Partial<AnnotationDefaultsType> | null>(null);
  const resourceUrl =
    process.env.NODE_ENV === 'production'
      ? `${API_URL}/ej2-pdfviewer-lib`
      : 'http://localhost:3011/ej2-pdfviewer-lib';

  const handleAnnotationAdd = (args: AnnotationArgs): void => {
    if (annotationData) {
      const container = document.getElementById('container');
      const viewer = (container as any)?.ej2_instances?.[0];
      if (viewer) {
        viewer.annotation.deleteAnnotationById(args.annotationId);
      }
      toast.warning('Mỗi danh mục giá chỉ được đánh dấu 1 mục.');
      return;
    }
    if (args.annotationType === 'Rectangle') {
      const newAnnotation = {
        annotationId: args.annotationId,
        pageIndex: args.pageIndex,
        annotationBound: args.annotationBound,
      };
      setAnnotationData(newAnnotation);
      onSave(JSON.stringify(newAnnotation));
    }
  };

  const handleAnnotationRemove = (args: any): void => {
    console.log('Annotation bị xóa:', args);
    setAnnotationData(null);
  };

  const handleAnnotationResize = (args: AnnotationArgs): void => {
    console.log('Annotation resized:', args);
    if (annotation) {
      // Cập nhật annotationData với annotationId mới (nếu bị thay đổi) và bound mới
      const updatedAnnotation = {
        ...annotation,
        annotationId: args.annotationId, // cập nhật annotationId mới
        annotationBound: args.annotationBound,
      };

      setAnnotationData(updatedAnnotation);
      onSave(JSON.stringify(updatedAnnotation));
    }
  };

  const drawAnnotation = (): void => {
    if (annotation?.annotationId) {
      const container = document.getElementById('container');
      const viewer = (container as any)?.ej2_instances?.[0];
      if (!viewer || !annotation) {
        console.error('PDF Viewer chưa sẵn sàng hoặc không có annotation.');
        return;
      }
      const { left, top, width, height } = annotation.annotationBound;
      const { opacity, fillColor, strokeColor, thickness } = annotation.annotationSettings;
      const pageIndex = annotation.pageIndex;

      const rectangleAnnotation = {
        offset: { x: left, y: top },
        pageNumber: pageIndex + 1,
        vertexPoints: [
          { x: left, y: top },
          { x: left + width, y: top },
          { x: left + width, y: top + height },
          { x: left, y: top + height },
        ],
        opacity,
        fillColor,
        strokeColor,
        thickness,
        subject: 'Rectangle',
        width,
        height,
      };

      setTimeout(() => {
        viewer.annotation.setAnnotationMode('AnnotationEdit');
        viewer.annotation.addAnnotation('Rectangle', rectangleAnnotation);
        navigaionToRectangleAnnotation(viewer, annotation);
      }, 600);
    }
  };

  const navigaionToRectangleAnnotation = (
    viewer: any,
    annotation: AnnotationDefaultsType
  ): void => {
    viewer.magnificationModule.zoomTo(100);
    const { left, top } = annotation.annotationBound;
    const pageNumber = annotation.pageIndex + 1;
    const pagePoint = { x: left, y: top };
    const clientPoint = viewer.convertPagePointToClientPoint(pagePoint, pageNumber);
    const viewerContainer = document.getElementById('container')?.querySelector('.e-pv-viewer-container') as HTMLElement;
    if (viewerContainer) {
      viewerContainer.scrollLeft = clientPoint.x;
      viewerContainer.scrollTop = clientPoint.y - 50; // trừ bớt 50 đơn vị cho dễ nhìn
    } else {
      toast.warning('Không tìm thấy vị trí đã đánh dấu');
    }
  };

  useEffect(() => {
    if (annotation?.annotationId) {
      drawAnnotation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotation]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      {documentPath && (
        <PdfViewerComponent
          id="container"
          documentPath={documentPath}
          resourceUrl={resourceUrl}
          style={{ width: '100%', height: '100%' }}
          annotationAdd={handleAnnotationAdd}
          annotationRemove={handleAnnotationRemove}
          annotationResize={handleAnnotationResize}
          documentLoad={drawAnnotation}
        >
          <Inject
            services={[
              Toolbar,
              Annotation,
              Magnification,
              Navigation,
              LinkAnnotation,
              BookmarkView,
              ThumbnailView,
              Print,
              TextSelection,
              TextSearch,
              FormFields,
              FormDesigner,
              PageOrganizer,
            ]}
          />
        </PdfViewerComponent>
      )}
    </div>
  );
});

export default TDPdf;
