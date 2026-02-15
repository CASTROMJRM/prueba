interface Props {
  currentPage: string;
}

const Breadcrumbs = ({ currentPage }: Props) => {
  return (
    <nav className="breadcrumbs">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">INICIO</li>
        {currentPage !== "Inicio" && (
          <>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-current">{currentPage}</li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
