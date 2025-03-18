document.getElementById("method").addEventListener("change", function () {
    let method = this.value;
    document.getElementById("json-body-section").style.display = (method === "POST" || method === "PUT") ? "block" : "none";
    document.getElementById("file-upload-section").style.display = (method === "POST" || method === "PUT") ? "block" : "none";
});

async function sendRequest() {
    const url = document.getElementById("api-url").value.trim();
    const method = document.getElementById("method").value;
    const apiKey = document.getElementById("api-key").value.trim(); // Lấy API Key từ ô nhập
    const responseDiv = document.getElementById("response");
    responseDiv.innerText = "⏳ Đang gửi request...";

    if (!url || !apiKey) {
        responseDiv.innerText = "❌ Vui lòng nhập API URL và API Key!";
        return;
    }

    let headers = { "Content-Type": "application/json" };
    let body = null;

    if (method === "POST" || method === "PUT") {
        const fileInput = document.getElementById("file-input");
        if (fileInput.files.length > 0) {
            // Nếu có file, gửi request dưới dạng FormData
            let formData = new FormData();
            formData.append("image", fileInput.files[0]); // Sửa thành "image" thay vì "file"
            body = formData;
            headers = {}; // FormData tự động thiết lập Content-Type
        } else {
            // Nếu không có file, gửi request dạng JSON
            body = document.getElementById("body").value.trim();
            if (body) {
                try {
                    body = JSON.stringify(JSON.parse(body)); // Xác nhận JSON hợp lệ
                } catch (e) {
                    responseDiv.innerText = "❌ Lỗi: Body không phải JSON hợp lệ!";
                    return;
                }
            } else {
                body = null; // Không gửi body nếu trống
            }
        }
    }

    try {
        const response = await fetch(`${url}?key=${apiKey}`, {
            method,
            headers,
            body: method !== "GET" && method !== "DELETE" ? body : null
        });

        const text = await response.text(); // Đọc response dưới dạng text trước khi parse JSON
        try {
            const data = JSON.parse(text);
            responseDiv.innerText = JSON.stringify(data, null, 2);
        } catch (error) {
            responseDiv.innerText = `⚠️ Phản hồi không phải JSON:\n${text}`;
        }
    } catch (error) {
        responseDiv.innerText = `❌ Lỗi: ${error.message}`;
    }
}

// ✅ API Key cho ImgBB
async function uploadImage() {
    const fileInput = document.getElementById("file-input");
    const responseDiv = document.getElementById("response");

    if (fileInput.files.length === 0) {
        responseDiv.innerText = "❌ Vui lòng chọn một file!";
        return;
    }

    const apiKey = document.getElementById("api-key").value.trim(); // Lấy API Key từ ô nhập
    if (!apiKey) {
        responseDiv.innerText = "❌ Vui lòng nhập API Key!";
        return;
    }

    let formData = new FormData();
    formData.append("image", fileInput.files[0]); // Đính kèm file
    formData.append("name", fileInput.files[0].name); // Đính kèm tên file (tùy chọn)

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData
        });

        const text = await response.text(); // Kiểm tra phản hồi trước khi parse JSON
        try {
            const data = JSON.parse(text);
            responseDiv.innerText = JSON.stringify(data, null, 2);

            // Hiển thị link ảnh đã tải lên
            if (data.data && data.data.url) {
                responseDiv.innerHTML += `<p>✅ Ảnh đã tải lên: <a href="${data.data.url}" target="_blank">${data.data.url}</a></p>`;
            }
        } catch (error) {
            responseDiv.innerText = `⚠️ Phản hồi không phải JSON:\n${text}`;
        }
    } catch (error) {
        responseDiv.innerText = `❌ Lỗi: ${error.message}`;
    }
}
