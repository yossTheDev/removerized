import "./loader.css"

export const Loader = () => {
  return (
    <div className="loadingspinner">
      <div className="bg-primary" id="square1"></div>
      <div className="bg-primary" id="square2"></div>
      <div className="bg-primary" id="square3"></div>
      <div className="bg-primary" id="square4"></div>
      <div className="bg-primary" id="square5"></div>
    </div>
  )
}
