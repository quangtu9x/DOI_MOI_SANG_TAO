import { useState, useEffect } from 'react';
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
let pdfviewer;
const annotationDefaults = {
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

import { toAbsoluteUrl } from '@/_metronic/helpers';
import { API_URL } from '@/utils/baseAPI';


const TDPdf = ({ documentPath, onSave, annotationSaved }) => {
  const annotation = { ...annotationDefaults, ...JSON.parse(annotationSaved) };
  const [annotationData, setAnnotationData] = useState(null);
  const resourceUrl = process.env.NODE_ENV === 'production' ? `${API_URL}/ej2-pdfviewer-lib` : 'http://localhost:3011/ej2-pdfviewer-lib';

  const handleAnnotationAdd = args => {
    if (annotationData) {
      const viewer = document.getElementById('container').ej2_instances[0];
      viewer.annotation.deleteAnnotationById(args.annotationId);
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

  const handleAnnotationRemove = args => {
    console.log('Annotation bị xóa:', args);
    setAnnotationData(null);
  };

  const drawAnnotation = () => {
    if (annotation?.annotationId) {
      var viewer = document.getElementById('container').ej2_instances[0];
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
        viewer.annotation.addAnnotation('Rectangle', rectangleAnnotation);
        navigaionToRectangleAnnotation(viewer, annotation);
      }, 600);
    }
  };

  const navigaionToRectangleAnnotation = (viewer, annotation) => {
    viewer.magnificationModule.zoomTo(100);
    const { left, top } = annotation.annotationBound;
    const pageNumber = annotation.pageIndex + 1;
    const pagePoint = { x: left, y: top };
    const clientPoint = viewer.convertPagePointToClientPoint(pagePoint, pageNumber);
    const viewerContainer = document.getElementById('container').querySelector('.e-pv-viewer-container');
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
  }, [annotation]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      {documentPath && (
        <PdfViewerComponent
          id="container"
          ref={scope => {
            pdfviewer = scope;
          }}
          documentPath={documentPath}
          resourceUrl={resourceUrl}
          style={{ width: '100%', height: '100%' }}
          annotationAdd={handleAnnotationAdd}
          annotationRemove={handleAnnotationRemove}
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
};

export default TDPdf;
