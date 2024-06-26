import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Topnav from '../components/Topnav';
import '../css/NeedForm.css';
import Footer from '../components/Footer';
import Autoword from '../components/Autoword';
import { useNavigate } from 'react-router-dom';

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function isValidNumber(num) {
    return /^\d+$/.test(num);
}
function Need_form() {
    const navigate = useNavigate();

    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [numPhotos, setNumPhotos] = useState(0);
    const [productName, setProductName] = useState('');
    const [productTag, setProductTag] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [productInfo, setProductInfo] = useState('');
    const [hashtagList, setHashtagList] = useState([]);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = localStorage.getItem('token') || '';
                const response = await axios.get('https://catholic-mibal.site/token/check', {
                    headers: {
                        Authorization: token,
                    },
                });
                console.log('need form useEffect');
                if (response.data.code[0] === 'SEC-001' || response.data.code[0] === 'SEC-002') {
                    alert('다시 로그인해주세요!');
                    localStorage.removeItem('token');
                    navigate('/');
                }
            } catch (error) {
                console.error(error);
            }
        };

        checkLoginStatus();
    }, [navigate]);

    const handleProductInfoChange = (e) => {
        setProductInfo(e.target.value);
    };
    const handlePhotoDelete = (index) => {
        const newPhotos = [...selectedPhotos];
        newPhotos.splice(index, 1);
        setSelectedPhotos(newPhotos);
        setNumPhotos(newPhotos.length);
    };

    const handlePhotoSelect = (event) => {
        const files = Array.from(event.target.files);
        if (selectedPhotos.length + files.length > 5) {
            alert('사진은 최대 5개까지 올릴 수 있습니다.');
            return;
        }

        setSelectedPhotos([...selectedPhotos, ...files]);
        setNumPhotos(selectedPhotos.length + files.length);

        event.target.value = '';
    };

    const handleSubmit = async () => {
        if (
            productName.trim() === '' ||
            selectedPhotos.length === 0 ||
            hashtagList.length === 0 ||
            price.trim() === '' ||
            duration.trim() === '' ||
            productInfo.trim() === ''
        ) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        if (!isValidNumber(price) || !isValidNumber(duration)) {
            alert('가격과 기간은 숫자만 입력 가능합니다.');
            return;
        }

        if (selectedPhotos.length < 1 || selectedPhotos.length > 5) {
            alert('사진은 최소 1장 이상, 최대 5장까지 올릴 수 있습니다.');
            return;
        }

        if (hashtagList.length < 1 || hashtagList.length > 5) {
            alert('해시태그는 최소 1개 이상, 최대 5개까지 입력할 수 있습니다.');
            return;
        }

        try {
            const NeedFormData = {
                title: productName,
                content: productInfo,
                cost: parseInt(price, 10),
                hashTag: hashtagList.map((tag) => `#${tag}`).join(''),
                perDate: parseInt(duration, 10),
                postType: 'NEED',
            };
            console.log(NeedFormData);
            const response = await axios.post('http://localhost:8080/api/post', NeedFormData);
            console.log('Success:', response.data);

            const postId = response.data.data.postId;
            await uploadImages(postId);
            console.log('post 완료');
            navigate('/need');
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const uploadImages = async (postId) => {
        const formData = new FormData();
        formData.append('postId', postId);
        selectedPhotos.forEach((photo) => {
            formData.append('files', photo);
        });

        try {
            const token = localStorage.getItem('token') || '';
            const response = await axios.post('http://localhost:8080/api/image', formData, {
                headers: {
                    Authorization: token,
                },
            });
            console.log('Image Upload Success:', response.data);
        } catch (error) {
            console.error('Image Upload Error:', error);
        }
    };

    const handleEnterPress = (e) => {
        if (e.key === 'Enter') {
            addHashtagToList();
        }
    };

    const handleDurationChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setDuration(value);
    };

    const addHashtagToList = () => {
        if (productTag.trim() !== '') {
            const isValidHashtag = /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣_]*$/.test(productTag.trim());
            if (isValidHashtag) {
                if (productTag.trim().length <= 7) {
                    if (hashtagList.length < 5 && !hashtagList.includes(productTag)) {
                        setHashtagList([...hashtagList, productTag]);
                        setProductTag('');
                    }
                } else {
                    alert('해시태그는 최대 7자까지 입력할 수 있습니다.');
                }
            } else {
                alert('해시태그는 영문, 한글, 숫자, 언더바(_)만 입력 가능합니다.');
            }
        }
    };

    const handleHashtagDelete = (tag) => {
        setHashtagList(hashtagList.filter((item) => item !== tag));
    };

    return (
        <div className="container">
            <Topnav />
            <div className="need-form-product-img">
                <div className="need-form-product-img-title">제품 사진</div>
                <div className="need-photo-big-container">
                    <div className="need-photo-container">
                        <div
                            className="need-upload-box"
                            onClick={() => document.getElementById('photo-upload').click()}
                        >
                            <img src="/assets/camera_add.svg" alt="camera_add" width={26} height={23} />
                            <div className="need-form-photo-num">{numPhotos}/5</div>
                        </div>
                    </div>
                    <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        style={{ display: 'none' }}
                    />
                    {selectedPhotos.map((photo, index) => (
                        <div key={index} className="need-photo-wrapper">
                            <img src={URL.createObjectURL(photo)} alt={`Selected ${index + 1}`} className="photo" />
                            <button className="need-delete-button" onClick={() => handlePhotoDelete(index)}>
                                <img src="/assets/form_image_delete.svg" alt="delete" width={10} height={10} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="need-form-product-name">
                <div className="need-from-product-name-title">제목</div>
                <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="제품 이름을제품 이름 및 제목을 입력하세요."
                />
            </div>
            <div className="need-form-hashtag">
                <div className="need-form-product-name-hashtag-title">해시태그</div>
                <div className="hashtag-list">
                    {hashtagList.map((tag, index) => (
                        <div key={index} className="hashtag-item">
                            #{tag}{' '}
                            <button onClick={() => handleHashtagDelete(tag)}>
                                <img src="/assets/form_hashtag_delete.svg" alt="delete" width={10} height={10} />
                            </button>
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
                <Autoword keyword={productTag} onSearch={setProductTag} className="lend-autoword" />
                <div className="lend-form-hashtag-info">
                    ▪ 태그는 띄어쓰기로 구분되며 최대 7자까지 입력할 수 있어요.
                    <br />
                    ▪ 최대 5개 까지 등록 가능합니다.
                    <br />
                    ▪ 태그를 통해서 사람들이 내 게시물을 검색해서 들어올 수 있어요.
                    <br />▪ 상품과 관련 없는 태그를 입력할 경우, 판매에 제재를 받을 수 있어요.
                </div>
            </div>
            <div className="need-form-price">
                <div className="need-form-price-title">가격</div>
                <input
                    className="need-form-price-krw"
                    type="text"
                    value={formatNumber(price)}
                    onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
                    placeholder="₩"
                />

                <div className="need-form-price-unit">원</div>
                <div className="need-form-price-unit2"> /</div>
                <input
                    className="need-form-price-day"
                    type="text"
                    value={duration}
                    onChange={handleDurationChange}
                    placeholder=" 단위 날짜 입력"
                />
                <div className="need-form-price-unit2">일</div>
            </div>
            <div className="need-form-product-info">
                <div className="need-form-product-info-title">자세한 설명</div>
                <textarea
                    value={productInfo}
                    onChange={handleProductInfoChange}
                    placeholder={`브랜드, 모델명, 구매 시기, 하자 유무 등 상품 설명을 최대한 자세히 적어주세요.\n전화번호, SNS 계정 등 개인정보 입력은 제한될 수 있어요.`}
                ></textarea>
            </div>
            <div className="need-form-submit-container">
                <div className="need-form-submit-small-container">
                    <button className="need-form-submit" onClick={handleSubmit}>
                        등록하기
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Need_form;
