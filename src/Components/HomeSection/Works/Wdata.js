import { useTranslation } from "react-i18next";

const Wdata = () => {
  const { t } = useTranslation();

  const data = [
    {
      id: 1,
      cover:
        "https://res.cloudinary.com/dykzph9bu/image/upload/v1726928048/work-1_if3ttl.png",
      title: t("wdata.0.title"),
      desc: t("wdata.0.desc"),
    },
    {
      id: 2,
      cover:
        "https://res.cloudinary.com/dykzph9bu/image/upload/v1726928048/work-2_l0sfoh.png",
      title: t("wdata.1.title"),
      desc: t("wdata.1.desc"),
    },
    {
      id: 3,
      cover:
        "https://res.cloudinary.com/dykzph9bu/image/upload/v1726928048/work-3_f6mzq2.png",
      title: t("wdata.2.title"),
      desc: t("wdata.2.desc"),
    },
  ];

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          <img src={item.cover} alt={item.title} />
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default Wdata;
