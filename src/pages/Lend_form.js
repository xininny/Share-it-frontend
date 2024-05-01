import React, { useState } from "react";
import axios from "axios";
import Topnav from "../components/Topnav";
import "../css/Lend_form.css";
import Footer from "../components/Footer";
import Autoword from "../components/Autoword";

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isValidNumber(num) {
  return /^\d+$/.test(num);
}
function Lend_form() {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [numPhotos, setNumPhotos] = useState(0);
  const [productName, setProductName] = useState("");
  const [productTag, setProductTag] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [hashtagList, setHashtagList] = useState([]);

  const handleProductInfoChange = (e) => {
    setProductInfo(e.target.value);
  };
  const handlePhotoSelect = (event) => {
    const files = Array.from(event.target.files);
    if (selectedPhotos.length + files.length > 5) {
      alert("사진은 최대 5개까지 올릴 수 있습니다.");
      return;
    }
    setSelectedPhotos([...selectedPhotos, ...files]);
    setNumPhotos(selectedPhotos.length + files.length);
  };

  const handlePhotoDelete = (index) => {
    const newPhotos = [...selectedPhotos];
    newPhotos.splice(index, 1);
    setSelectedPhotos(newPhotos);
    setNumPhotos(newPhotos.length);
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!isValidNumber(price) || !isValidNumber(duration)) {
      alert("가격과 단위 날짜는 숫자로 입력되어야 합니다.");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    selectedPhotos.forEach((photo) => {
      formData.append("photos", photo);
    });

    // Append product name, price, and duration to FormData
    formData.append("productName", productName);
    formData.append("price", formatNumber(price)); // 숫자 포맷팅
    formData.append("duration", duration);
    formData.append("productInfo", productInfo);

    try {
      // Send POST request to backend server
      const response = await axios.post(
        "http://your-backend-url/upload-photos",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data); // Handle response from server
      alert("Photos uploaded successfully!");
      // Reset state or navigate to another page upon successful upload
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload photos. Please try again later.");
    }
  };
  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      addHashtagToList();
    }
  };

  const addHashtagToList = () => {
    if (productTag.trim() !== "") {
      if (hashtagList.length < 5 && !hashtagList.includes(productTag)) {
        setHashtagList([...hashtagList, productTag]);
        setProductTag("");
      }
    }
  };

  const handleHashtagDelete = (tag) => {
    setHashtagList(hashtagList.filter((item) => item !== tag));
  };
  return (
    <div className="container">
      <Topnav />
      <div className="lend-form-product-img">
        <p>제품 사진</p>
        <div className="photo-container">
          <div
            className="upload-box"
            onClick={() => document.getElementById("photo-upload").click()}
          >
            <img
              src="/assets/camera_add.svg"
              alt="camera_add"
              width={26}
              height={23}
            />
            <div>{numPhotos}/5</div>
          </div>
        </div>
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          style={{ display: "none" }}
        />
        {selectedPhotos.map((photo, index) => (
          <div key={index} className="photo-wrapper">
            <img
              src={URL.createObjectURL(photo)}
              alt={`Selected ${index + 1}`}
              className="photo"
            />
            <button
              className="delete-button"
              onClick={() => handlePhotoDelete(index)}
            >
              X
            </button>
          </div>
        ))}
      </div>
      <div className="lend-form-product-name">
        <p>제품 이름</p>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="제품 이름을 입력하세요."
        />
      </div>
      <div className="lend-form-hashtag">
        <p>해시태그</p>
        <div className="hasttag-list">
          {hashtagList.map((tag, index) => (
            <div key={index} className="hashtag-item">
              # {tag}{" "}
              <button onClick={() => handleHashtagDelete(tag)}>X</button>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={productTag}
          onChange={(e) => setProductTag(e.target.value)}
          onKeyDown={handleEnterPress}
          placeholder="제품과 관련된 해시태그를 입력해 주세요. (최대 5개)"
        />
        <Autoword
          keyword={productTag}
          onSearch={setProductTag}
          className="lend-autoword"
        />
        <div className="lend-form-hastag-info">
          ▪ 태그는 띄어쓰기로 구분되며 최대 9자까지 입력할 수 있어요.
          <br />
          ▪ 대충 번개장터에서 긁어온거임. 여기다가는 관련된 매뉴얼 적어놓으면
          될듯
          <br />
          ▪ 사람들이 내 상품을 더 잘 찾을 수 있어요.
          <br />▪ 상품과 관련 없는 태그를 입력할 경우, 판매에 제재를 받을 수
          있어요.
        </div>
      </div>
      <div className="lend-form-price">
        <p>가격</p>
        <input
          className="lend-form-price-krw"
          type="text"
          value={formatNumber(price)}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
          placeholder="₩"
        />

        <p className="lend-form-price-unit">원</p>
        <p className="lend-form-price-unit2"> /</p>
        <input
          className="lend-form-price-day"
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder=" 단위 날짜 입력"
        />
        <p className="lend-form-price-unit2">일</p>
      </div>
      <div className="lend-form-product-info">
        <p>자세한 설명</p>
        <textarea
          value={productInfo}
          onChange={handleProductInfoChange}
          placeholder={`브랜드, 모델명, 구매 시기, 하자 유무 등 상품 설명을 최대한 자세히 적어주세요.\n전화번호, SNS 계정 등 개인정보 입력은 제한될 수 있어요.`}
        ></textarea>
      </div>

      <div className="lend-form-trade-date">
        <p>거래 날짜</p>
      </div>
      <button onClick={handleSubmit}>작성 완료</button>
      <Footer />
    </div>
  );
}

export default Lend_form;