const HeaderTitle = ({ title }) => {
  return (
    <div className="d-flex align-items-center mb-4">
      <h3 className="m-form-headtitle me-1 mb-0 ms--10 text-primary">{title}</h3>
      <span className={`bullet bullet-horizontal flex-grow-1 bg-secondary h-1px`}></span>
    </div>
  );
};

export default HeaderTitle;

export const SubTitle = ({ title, className = "" }) => {
  return (
    <div className="d-flex align-items-center mb-4">
      <h5
        className={className + "m-form-headtitle fst-italic me-1 mb-0 ms--10"}
      >
        {title}
      </h5>
    </div>
  );
};