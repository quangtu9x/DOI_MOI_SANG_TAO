import { Card } from "antd"
import { Link } from "react-router-dom";

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const StartCard = (props) => {
    const { item, key } = props
    return (
        <Card key={key} className="card-social">
            <div className="border-bottom" style={{ padding: "16px" }}>
                <div className="row align-items-center justify-content-center">
                    <div className="col-auto">
                        <i className={`${item.icon} text-${item.color} fs-2x`} />
                    </div>
                    <div className="col text-end">
                        <h2>
                            {formatNumber(item.value)}{" "}
                            <i className="text-muted fs-8">{item.afterValue}</i>
                        </h2>
                        <h5 className="mb-0">
                            <Link to={`${item.link}`} className={`text-muted text-hover-${item.color}`}>
                                {item.title}
                            </Link>
                        </h5>
                    </div>
                </div>
            </div>
        </Card>
    );
}