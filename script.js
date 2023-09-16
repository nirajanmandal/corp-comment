const MAX_CHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

const textareaEL = document.querySelector(".form__textarea");
const counterEL = document.querySelector(".counter");
const formEL = document.querySelector(".form");
const feedbackListEL = document.querySelector(".feedbacks");
const submitBtnEL = document.querySelector(".submit-btn");
const spinnerEL = document.querySelector(".spinner");
const hashtagListEL = document.querySelector(".hashtags");

const renderFeedbackItem = (feedbackItem) => {
  const feedbackItemHTML = `
  <li class="feedback">
    <button class="upvote">
      <i class="fa-solid fa-caret-up upvote__icon"></i>
      <span class="upvote__count">${feedbackItem.upvoteCount}</span>
    </button>
    <section class="feedback__badge">
        <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
    </section>
    <div class="feedback__content">
        <p class="feedback__company">${feedbackItem.company}</p>
        <p class="feedback__text">${feedbackItem.text}</p>
    </div>
    <p class="feedback__date">${
      feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
    }</p>
  </li>
  `;

  feedbackListEL.insertAdjacentHTML("beforeend", feedbackItemHTML);
};

(() => {
  const inputHandler = () => {
    maxNumberOfChars = MAX_CHARS;
    numberOfCharsTyped = textareaEL.value.length;
    charsLeft = maxNumberOfChars - numberOfCharsTyped;
    counterEL.textContent = charsLeft;
  };
  textareaEL.addEventListener("input", inputHandler);
})();

const showVisualIndicator = (textCheck) => {
  const className = textCheck === "valid" ? "form--valid" : "form-invalid";
  formEL.classList.add(className);
  setTimeout(() => {
    formEL.classList.remove(className);
  }, 2000);
};

(() => {
  const submitHandler = (e) => {
    e.preventDefault();
    const text = textareaEL.value;

    if (text.includes("#") && text.length >= 5) {
      showVisualIndicator("valid");
    } else {
      showVisualIndicator("invalid");
      textareaEL.focus();
      return;
    }

    const hashTag = text.split(" ").find((word) => word.includes("#"));
    const company = hashTag.substring(1);
    const badgeLetter = company.substring(0, 1);
    const upvoteCount = 0;
    const daysAgo = 0;

    const feedbackItem = {
      company,
      badgeLetter,
      upvoteCount,
      daysAgo,
      text,
    };

    renderFeedbackItem(feedbackItem);

    fetch(`${BASE_API_URL}/feedbacks`, {
      method: "POST",
      body: JSON.stringify(feedbackItem),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          console.log("Something went wrong");
          return;
        }
        console.log("Successfully submitted");
      })
      .catch((error) => console.log(error));

    textareaEL.value = "";
    submitBtnEL.blur();
    counterEL.textContent = MAX_CHARS;
  };
  formEL.addEventListener("submit", submitHandler);
})();

(() => {
  const clickHandler = (event) => {
    const clickedEL = event.target;
    const upvoteIntention = clickedEL.className.includes("upvote");

    if (upvoteIntention) {
      const upvoteBtnEL = clickedEL.closest(".upvote");
      upvoteBtnEL.disabled = true;

      const upvoteCountEl = upvoteBtnEL.querySelector(".upvote__count");
      let upvoteCount = +upvoteCountEl.textContent;
      upvoteCountEl.textContent = ++upvoteCount;
    } else {
      clickedEL.closest(".feedback").classList.toggle("feedback--expand");
    }
  };
  feedbackListEL.addEventListener("click", clickHandler);
})();

(() => {
  const clickHandler = (event) => {
    const clickedEl = event.target;
    if (clickedEl.className === "hashtags") return;

    const companyNameFromHashtag = clickedEl.textContent
      .substring(1)
      .toLowerCase()
      .trim();

    feedbackListEL.childNodes.forEach((childNode) => {
      if (childNode.nodeType === 3) return;
      const companyNameFromFeedbackItem = childNode
        .querySelector(".feedback__company")
        .textContent.toLowerCase()
        .trim();

      if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
        childNode.remove();
      }
    });
  };
  hashtagListEL.addEventListener("click", clickHandler);
})();

fetch(`${BASE_API_URL}/feedbacks`)
  .then((response) => response.json())
  .then((data) => {
    spinnerEL.remove();
    data.feedbacks.forEach((feedbackItem) => renderFeedbackItem(feedbackItem));
  })
  .catch((error) => {
    feedbackListEL.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
  });
